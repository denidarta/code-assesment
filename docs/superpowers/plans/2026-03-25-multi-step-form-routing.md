# Multi-Step Form Routing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the existing single-page multi-step registration form into URL-based routed pages (`/register/step-1`, `/register/step-2`, `/register/step-3`) with Zustand as global state and Zod for validation + step guard logic.

**Architecture:** React Router v7 handles URL routing; a Zustand store holds form data for all 3 steps plus a `completedSteps` set for guard logic; Zod schemas validate each step's data and power both inline field errors (via React Hook Form) and the step guard. On final submit, the entire form data is saved to `localStorage`.

**Tech Stack:** React 19, React Router DOM v7, Zustand v5, Zod v4, React Hook Form v7, TypeScript, Tailwind CSS v4, shadcn UI

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| **Create** | `src/lib/schemas.ts` | Zod schemas for Step1, Step2, Step3 — single source of truth for all validation |
| **Create** | `src/stores/registerStore.ts` | Zustand store: form data + `completedSteps` set + actions |
| **Create** | `src/router.tsx` | React Router config: `createBrowserRouter` with `/register/step-{1,2,3}` routes |
| **Modify** | `src/App.tsx` | Replace `<RegisterPage />` with `<RouterProvider router={router} />` |
| **Delete** | `src/pages/register.tsx` | Remove — logic moves to store + step pages |
| **Create** | `src/pages/register/StepGuard.tsx` | HOC/wrapper: checks `completedSteps`, redirects to latest valid step |
| **Modify** | `src/components/register/RegisterStep1.tsx` | Remove props-based pattern; use RHF + Zustand store + Zod; navigate on valid submit |
| **Modify** | `src/components/register/RegisterStep2.tsx` | Same as Step1 |
| **Modify** | `src/components/register/RegisterStep3.tsx` | Same + save to localStorage on submit |
| **Modify** | `src/components/register/ProgressIndicator.tsx` | Implement progress bar using `completedSteps` from store |

---

## Task 1: Zod Schemas — Single Source of Truth

**Files:**
- Create: `src/lib/schemas.ts`

Move all validation logic from the 3 step components into centralized Zod schemas. These will be imported by both the store (for guard logic) and each form step (for RHF resolver).

- [ ] **Step 1.1: Create `src/lib/schemas.ts`**

```ts
import { z } from "zod";

export const step1Schema = z
  .object({
    nama: z.string().min(1, "Nama lengkap wajib diisi"),
    phone: z
      .string()
      .regex(/^0\d{9,12}$/, "Masukkan nomor handphone yang valid"),
    phoneAlt: z
      .string()
      .regex(/^0\d{9,12}$/, "Masukkan nomor handphone yang valid"),
    email: z.string().email("Format email tidak valid"),
  })
  .refine((d) => d.phone !== d.phoneAlt, {
    message: "Tidak boleh sama dengan nomor handphone utama",
    path: ["phoneAlt"],
  });

export const step2Schema = z.object({
  tempatLahir: z.string().min(1, "Tempat lahir wajib diisi"),
  tanggalLahir: z.string().min(1, "Tanggal lahir wajib diisi"),
  nomorKTP: z
    .string()
    .regex(/^\d{16}$/, "Nomor KTP harus tepat 16 digit angka"),
  jenisKelamin: z.string().min(1, "Jenis kelamin wajib dipilih"),
  pendidikanTerakhir: z.string().min(1, "Pendidikan terakhir wajib dipilih"),
  statusPernikahan: z.string().min(1, "Status pernikahan wajib dipilih"),
  namaIbuKandung: z.string().min(1, "Nama ibu kandung wajib diisi"),
});

export const step3Schema = z.object({
  alamatKTP: z
    .string()
    .min(1, "Alamat KTP wajib diisi")
    .max(225, "Alamat maksimal 225 karakter"),
  provinsi: z.string().min(1, "Provinsi wajib dipilih"),
  kotaKabupaten: z.string().min(1, "Kota / Kabupaten wajib dipilih"),
  kecamatan: z.string().min(1, "Kecamatan wajib dipilih"),
  kelurahan: z.string().min(1, "Kelurahan wajib dipilih"),
  kodePos: z.string().min(1, "Kode pos wajib diisi"),
});

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
```

- [ ] **Step 1.2: Commit**

```bash
git add src/lib/schemas.ts
git commit -m "feat: add zod schemas for all 3 registration steps"
```

---

## Task 2: Zustand Store

**Files:**
- Modify: `src/stores/registerStore.ts` (currently empty)

Store holds form data per step, a `completedSteps` set (tracks which steps have been successfully submitted), and actions for updating data + marking steps complete.

- [ ] **Step 2.1: Implement `src/stores/registerStore.ts`**

```ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Step1Data, Step2Data, Step3Data } from "@/lib/schemas";

type RegisterState = {
  step1: Partial<Step1Data>;
  step2: Partial<Step2Data>;
  step3: Partial<Step3Data>;
  completedSteps: Set<number>;
  setStep1: (data: Step1Data) => void;
  setStep2: (data: Step2Data) => void;
  setStep3: (data: Step3Data) => void;
  getLatestValidStep: () => number;
  reset: () => void;
};

export const useRegisterStore = create<RegisterState>()(
  persist(
    (set, get) => ({
      step1: {},
      step2: {},
      step3: {},
      completedSteps: new Set<number>(),

      setStep1: (data) =>
        set((s) => ({
          step1: data,
          completedSteps: new Set([...s.completedSteps, 1]),
        })),

      setStep2: (data) =>
        set((s) => ({
          step2: data,
          completedSteps: new Set([...s.completedSteps, 2]),
        })),

      setStep3: (data) =>
        set((s) => ({
          step3: data,
          completedSteps: new Set([...s.completedSteps, 3]),
        })),

      /**
       * Returns the latest step number the user is allowed to access.
       * Step 1 is always accessible.
       * Step 2 requires step 1 complete.
       * Step 3 requires step 2 complete.
       */
      getLatestValidStep: () => {
        const { completedSteps } = get();
        if (completedSteps.has(2)) return 3;
        if (completedSteps.has(1)) return 2;
        return 1;
      },

      reset: () =>
        set({ step1: {}, step2: {}, step3: {}, completedSteps: new Set() }),
    }),
    {
      name: "register-form",
      // Set is not serializable by default — convert to array for storage
      partialize: (state) => ({
        step1: state.step1,
        step2: state.step2,
        step3: state.step3,
        completedSteps: [...state.completedSteps],
      }),
      merge: (persisted: unknown, current) => {
        const p = persisted as Partial<RegisterState> & {
          completedSteps?: number[];
        };
        return {
          ...current,
          ...p,
          completedSteps: new Set(p.completedSteps ?? []),
        };
      },
    }
  )
);
```

> **Note on `persist` + `Set`:** Zustand's `persist` middleware uses `JSON.stringify` which doesn't handle `Set`. The `partialize` option converts the Set to an array for storage, and `merge` converts it back on rehydration.

- [ ] **Step 2.2: Commit**

```bash
git add src/stores/registerStore.ts
git commit -m "feat: implement zustand register store with persist + step guard"
```

---

## Task 3: Step Guard Component

**Files:**
- Create: `src/pages/register/StepGuard.tsx`

A wrapper component used by each route. Reads `getLatestValidStep()` from the store and redirects the user if they try to access a step they haven't unlocked yet.

- [ ] **Step 3.1: Create `src/pages/register/StepGuard.tsx`**

```tsx
import { Navigate } from "react-router-dom";
import { useRegisterStore } from "@/stores/registerStore";

type Props = {
  step: number;           // which step this guard protects (1, 2, or 3)
  children: React.ReactNode;
};

/**
 * StepGuard — renders children only if the user is allowed to access `step`.
 * Otherwise redirects to `/register/step-{latestValidStep}`.
 */
export default function StepGuard({ step, children }: Props) {
  const latestValid = useRegisterStore((s) => s.getLatestValidStep());

  if (step > latestValid) {
    return <Navigate to={`/register/step-${latestValid}`} replace />;
  }

  return <>{children}</>;
}
```

- [ ] **Step 3.2: Commit**

```bash
git add src/pages/register/StepGuard.tsx
git commit -m "feat: add step guard component for URL-based step protection"
```

---

## Task 4: Router Configuration

**Files:**
- Create: `src/router.tsx`
- Modify: `src/App.tsx`

Set up React Router with 3 nested routes under `/register`. Each route is wrapped in `StepGuard`.

- [ ] **Step 4.1: Create `src/router.tsx`**

```tsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import StepGuard from "@/pages/register/StepGuard";
import RegisterStep1 from "@/components/register/RegisterStep1";
import RegisterStep2 from "@/components/register/RegisterStep2";
import RegisterStep3 from "@/components/register/RegisterStep3";
import RegisterLayout from "@/pages/register/RegisterLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/register/step-1" replace />,
  },
  {
    path: "/register",
    element: <RegisterLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/register/step-1" replace />,
      },
      {
        path: "step-1",
        element: (
          <StepGuard step={1}>
            <RegisterStep1 />
          </StepGuard>
        ),
      },
      {
        path: "step-2",
        element: (
          <StepGuard step={2}>
            <RegisterStep2 />
          </StepGuard>
        ),
      },
      {
        path: "step-3",
        element: (
          <StepGuard step={3}>
            <RegisterStep3 />
          </StepGuard>
        ),
      },
    ],
  },
]);
```

- [ ] **Step 4.2: Create `src/pages/register/RegisterLayout.tsx`**

Layout shared by all 3 step routes — renders the `ProgressIndicator` and the current step via `<Outlet />`.

```tsx
import { Outlet } from "react-router-dom";
import ProgressIndicator from "@/components/register/ProgressIndicator";

export default function RegisterLayout() {
  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto px-4 py-8">
      <h2 className="text-sm font-semibold">Informasi Data Diri</h2>
      <ProgressIndicator />
      <Outlet />
    </div>
  );
}
```

- [ ] **Step 4.3: Modify `src/App.tsx`**

Replace `<RegisterPage />` with the router provider. Remove unused imports.

```tsx
import { RouterProvider } from "react-router-dom";
import { router } from "./router";

function App() {
  return <RouterProvider router={router} />;
}

export default App;
```

- [ ] **Step 4.4: Commit**

```bash
git add src/router.tsx src/pages/register/RegisterLayout.tsx src/App.tsx
git commit -m "feat: setup react-router with /register/step-{1,2,3} routes and layout"
```

---

## Task 5: Refactor RegisterStep1

**Files:**
- Modify: `src/components/register/RegisterStep1.tsx`

Remove props-based data pattern. Read defaults from Zustand store, use React Hook Form with `zodResolver` for validation, navigate to step-2 on valid submit.

- [ ] **Step 5.1: Rewrite `src/components/register/RegisterStep1.tsx`**

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { step1Schema, type Step1Data } from "@/lib/schemas";
import { useRegisterStore } from "@/stores/registerStore";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function RegisterStep1() {
  const navigate = useNavigate();
  const { step1: savedData, setStep1 } = useRegisterStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: savedData as Step1Data,
    mode: "onChange",
  });

  const onSubmit = (data: Step1Data) => {
    setStep1(data);
    navigate("/register/step-2");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">1/3 Informasi Dasar</p>

      <Field>
        <FieldLabel>Nama Lengkap</FieldLabel>
        <Input {...register("nama")} placeholder="Masukkan nama lengkap" />
        {errors.nama && (
          <p className="text-sm text-destructive">{errors.nama.message}</p>
        )}
      </Field>

      <Field>
        <FieldLabel>Nomor Handphone</FieldLabel>
        <Input
          {...register("phone")}
          type="tel"
          placeholder="Masukkan nomor handphone"
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </Field>

      <Field>
        <FieldLabel>Nomor Handphone Alternatif</FieldLabel>
        <Input
          {...register("phoneAlt")}
          type="tel"
          placeholder="Masukkan nomor handphone alternatif"
        />
        {errors.phoneAlt && (
          <p className="text-sm text-destructive">{errors.phoneAlt.message}</p>
        )}
      </Field>

      <Field>
        <FieldLabel>Alamat Email</FieldLabel>
        <Input
          {...register("email")}
          type="email"
          placeholder="Masukkan alamat email"
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </Field>

      <Button type="submit" disabled={!isValid}>
        Selanjutnya
      </Button>
    </form>
  );
}
```

- [ ] **Step 5.2: Install `@hookform/resolvers` if not present**

```bash
npm list @hookform/resolvers || npm install @hookform/resolvers
```

- [ ] **Step 5.3: Commit**

```bash
git add src/components/register/RegisterStep1.tsx
git commit -m "refactor: migrate RegisterStep1 to RHF + zod + zustand store"
```

---

## Task 6: Refactor RegisterStep2

**Files:**
- Modify: `src/components/register/RegisterStep2.tsx`

Same pattern as Step1 — RHF + zodResolver + Zustand. Back button navigates to step-1.

- [ ] **Step 6.1: Rewrite `src/components/register/RegisterStep2.tsx`**

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { step2Schema, type Step2Data } from "@/lib/schemas";
import { useRegisterStore } from "@/stores/registerStore";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50";

const PENDIDIKAN_OPTIONS = ["SD", "SMP", "SMA", "Diploma", "Sarjana", "Magister", "Doktor"];
const STATUS_PERNIKAHAN_OPTIONS = ["Belum Kawin", "Menikah", "Cerai"];
const JENIS_KELAMIN_OPTIONS = ["Laki-Laki", "Perempuan"];

export default function RegisterStep2() {
  const navigate = useNavigate();
  const { step2: savedData, setStep2 } = useRegisterStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: savedData as Step2Data,
    mode: "onChange",
  });

  const onSubmit = (data: Step2Data) => {
    setStep2(data);
    navigate("/register/step-3");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => navigate("/register/step-1")}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Kembali
      </button>
      <p className="text-sm text-muted-foreground">2/3 Informasi Lanjutan</p>

      <Field>
        <FieldLabel>Tempat Lahir</FieldLabel>
        <Input {...register("tempatLahir")} placeholder="Masukkan tempat lahir" />
        {errors.tempatLahir && (
          <p className="text-sm text-destructive">{errors.tempatLahir.message}</p>
        )}
      </Field>

      <Field>
        <FieldLabel>Tanggal Lahir</FieldLabel>
        <Input {...register("tanggalLahir")} type="date" />
        {errors.tanggalLahir && (
          <p className="text-sm text-destructive">{errors.tanggalLahir.message}</p>
        )}
      </Field>

      <Field>
        <FieldLabel>Nomor KTP</FieldLabel>
        <Input
          {...register("nomorKTP")}
          placeholder="16 digit nomor KTP"
          maxLength={16}
          inputMode="numeric"
        />
        {errors.nomorKTP && (
          <p className="text-sm text-destructive">{errors.nomorKTP.message}</p>
        )}
      </Field>

      <Field>
        <FieldLabel>Jenis Kelamin</FieldLabel>
        <select {...register("jenisKelamin")} className={selectClass}>
          <option value="">Pilih jenis kelamin</option>
          {JENIS_KELAMIN_OPTIONS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        {errors.jenisKelamin && (
          <p className="text-sm text-destructive">{errors.jenisKelamin.message}</p>
        )}
      </Field>

      <Field>
        <FieldLabel>Pendidikan Terakhir</FieldLabel>
        <select {...register("pendidikanTerakhir")} className={selectClass}>
          <option value="">Pilih pendidikan terakhir</option>
          {PENDIDIKAN_OPTIONS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        {errors.pendidikanTerakhir && (
          <p className="text-sm text-destructive">{errors.pendidikanTerakhir.message}</p>
        )}
      </Field>

      <Field>
        <FieldLabel>Status Pernikahan</FieldLabel>
        <select {...register("statusPernikahan")} className={selectClass}>
          <option value="">Pilih status pernikahan</option>
          {STATUS_PERNIKAHAN_OPTIONS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        {errors.statusPernikahan && (
          <p className="text-sm text-destructive">{errors.statusPernikahan.message}</p>
        )}
      </Field>

      <Field>
        <FieldLabel>Nama Ibu Kandung</FieldLabel>
        <Input {...register("namaIbuKandung")} placeholder="Masukkan nama ibu kandung" />
        {errors.namaIbuKandung && (
          <p className="text-sm text-destructive">{errors.namaIbuKandung.message}</p>
        )}
      </Field>

      <Button type="submit" disabled={!isValid}>
        Selanjutnya
      </Button>
    </form>
  );
}
```

- [ ] **Step 6.2: Commit**

```bash
git add src/components/register/RegisterStep2.tsx
git commit -m "refactor: migrate RegisterStep2 to RHF + zod + zustand store"
```

---

## Task 7: Refactor RegisterStep3

**Files:**
- Modify: `src/components/register/RegisterStep3.tsx`

Final step. On valid submit: save to Zustand (`setStep3`), save entire form to `localStorage` as `register-submission`, navigate to `/register/step-3` (stays on page — no success page yet).

- [ ] **Step 7.1: Rewrite `src/components/register/RegisterStep3.tsx`**

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { step3Schema, type Step3Data } from "@/lib/schemas";
import { useRegisterStore } from "@/stores/registerStore";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50";

export default function RegisterStep3() {
  const navigate = useNavigate();
  const { step1, step2, step3: savedData, setStep3 } = useRegisterStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: savedData as Step3Data,
    mode: "onChange",
  });

  const alamatValue = watch("alamatKTP") ?? "";

  const onSubmit = (data: Step3Data) => {
    setStep3(data);
    const submission = { step1, step2, step3: data };
    localStorage.setItem("register-submission", JSON.stringify(submission));
    console.log("Submitted:", submission);
    // TODO: redirect to success page when ready
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => navigate("/register/step-2")}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Kembali
      </button>
      <p className="text-sm text-muted-foreground">3/3 Alamat Pribadi</p>

      <Field>
        <FieldLabel>Alamat sesuai KTP</FieldLabel>
        <textarea
          {...register("alamatKTP")}
          placeholder="Masukkan alamat sesuai KTP"
          maxLength={225}
          rows={3}
          className="w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 placeholder:text-muted-foreground resize-none"
        />
        <p className="text-xs text-muted-foreground text-right">
          {alamatValue.length}/225
        </p>
        {errors.alamatKTP && (
          <p className="text-sm text-destructive">{errors.alamatKTP.message}</p>
        )}
      </Field>

      <Field>
        <FieldLabel>Provinsi</FieldLabel>
        <select {...register("provinsi")} className={selectClass}>
          <option value="">Pilih provinsi</option>
        </select>
        {errors.provinsi && (
          <p className="text-sm text-destructive">{errors.provinsi.message}</p>
        )}
      </Field>

      <Field>
        <FieldLabel>Kota / Kabupaten</FieldLabel>
        <select {...register("kotaKabupaten")} className={selectClass}>
          <option value="">Pilih kota / kabupaten</option>
        </select>
        {errors.kotaKabupaten && (
          <p className="text-sm text-destructive">{errors.kotaKabupaten.message}</p>
        )}
      </Field>

      <Field>
        <FieldLabel>Kecamatan</FieldLabel>
        <select {...register("kecamatan")} className={selectClass}>
          <option value="">Pilih kecamatan</option>
        </select>
        {errors.kecamatan && (
          <p className="text-sm text-destructive">{errors.kecamatan.message}</p>
        )}
      </Field>

      <Field>
        <FieldLabel>Kelurahan</FieldLabel>
        <select {...register("kelurahan")} className={selectClass}>
          <option value="">Pilih kelurahan</option>
        </select>
        {errors.kelurahan && (
          <p className="text-sm text-destructive">{errors.kelurahan.message}</p>
        )}
      </Field>

      <Field>
        <FieldLabel>Kode Pos</FieldLabel>
        <Input
          {...register("kodePos")}
          placeholder="Masukkan kode pos"
          inputMode="numeric"
        />
        {errors.kodePos && (
          <p className="text-sm text-destructive">{errors.kodePos.message}</p>
        )}
      </Field>

      <Button type="submit" disabled={!isValid}>
        Daftar
      </Button>
    </form>
  );
}
```

- [ ] **Step 7.2: Commit**

```bash
git add src/components/register/RegisterStep3.tsx
git commit -m "refactor: migrate RegisterStep3 to RHF + zod + zustand, save to localStorage on submit"
```

---

## Task 8: Progress Indicator

**Files:**
- Modify: `src/components/register/ProgressIndicator.tsx`

Implement a simple 3-step visual progress bar. Read `completedSteps` from the store and highlight the active step from the current URL.

- [ ] **Step 8.1: Implement `src/components/register/ProgressIndicator.tsx`**

```tsx
import { useLocation } from "react-router-dom";
import { useRegisterStore } from "@/stores/registerStore";
import { cn } from "@/lib/utils";

const STEPS = [
  { num: 1, label: "Informasi Dasar" },
  { num: 2, label: "Informasi Lanjutan" },
  { num: 3, label: "Alamat Pribadi" },
];

export default function ProgressIndicator() {
  const location = useLocation();
  const completedSteps = useRegisterStore((s) => s.completedSteps);

  // Extract current step number from URL: /register/step-2 → 2
  const match = location.pathname.match(/step-(\d+)/);
  const currentStep = match ? Number(match[1]) : 1;

  return (
    <div className="flex items-start gap-0 w-full">
      {STEPS.map((step, idx) => {
        const isCompleted = completedSteps.has(step.num);
        const isActive = step.num === currentStep;

        return (
          <div key={step.num} className="flex-1 flex flex-col items-center">
            {/* Line + circle row */}
            <div className="flex items-center w-full">
              {/* Left connector line */}
              <div
                className={cn(
                  "flex-1 h-0.5",
                  idx === 0 ? "invisible" : isCompleted ? "bg-primary" : "bg-muted"
                )}
              />
              {/* Circle */}
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 shrink-0",
                  isCompleted
                    ? "bg-primary border-primary text-primary-foreground"
                    : isActive
                    ? "bg-background border-primary text-primary"
                    : "bg-background border-muted text-muted-foreground"
                )}
              >
                {isCompleted ? "✓" : step.num}
              </div>
              {/* Right connector line */}
              <div
                className={cn(
                  "flex-1 h-0.5",
                  idx === STEPS.length - 1
                    ? "invisible"
                    : completedSteps.has(step.num)
                    ? "bg-primary"
                    : "bg-muted"
                )}
              />
            </div>
            {/* Label */}
            <span
              className={cn(
                "text-xs mt-1 text-center",
                isActive ? "text-primary font-medium" : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 8.2: Commit**

```bash
git add src/components/register/ProgressIndicator.tsx
git commit -m "feat: implement progress indicator with step completion state"
```

---

## Task 9: Cleanup — Remove Old register.tsx

**Files:**
- Delete: `src/pages/register.tsx`

The type definitions (`Step1Data`, `Step2Data`, `Step3Data`) have moved to `src/lib/schemas.ts`. The orchestrator logic is now in the store + router. This file is no longer needed.

- [ ] **Step 9.1: Verify nothing imports from `src/pages/register.tsx`**

```bash
grep -r "from.*pages/register" src/
```

Expected: No output (all imports should have been updated in Tasks 5–7 to use `@/lib/schemas`).

- [ ] **Step 9.2: Delete the file**

```bash
rm src/pages/register.tsx
```

- [ ] **Step 9.3: Commit**

```bash
git add -A
git commit -m "chore: remove legacy register.tsx page (replaced by router + store)"
```

---

## Task 10: Smoke Test — Manual Verification

- [ ] **Step 10.1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 10.2: Verify guard behavior**

Open browser and check each scenario:

| URL visited | Expected behavior |
|-------------|-------------------|
| `/` | Redirects to `/register/step-1` |
| `/register` | Redirects to `/register/step-1` |
| `/register/step-2` (fresh) | Redirects to `/register/step-1` |
| `/register/step-3` (fresh) | Redirects to `/register/step-1` |
| Fill step-1 → submit | Navigates to `/register/step-2` |
| Go back to `/register/step-3` manually | Redirects to `/register/step-2` (latest valid) |
| Fill step-2 → submit | Navigates to `/register/step-3` |
| Refresh browser on `/register/step-2` | Stays on step-2 (Zustand persist) |
| Fill step-3 → Daftar | `localStorage["register-submission"]` contains all 3 steps |

- [ ] **Step 10.3: Verify localStorage output**

Open DevTools → Application → Local Storage → check `register-submission` key contains the full form data.

- [ ] **Step 10.4: Commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix: address issues found during smoke test"
```

---

## Summary of New File Structure

```
src/
├── App.tsx                                    ← RouterProvider only
├── router.tsx                                 ← NEW: createBrowserRouter config
├── lib/
│   ├── utils.ts                               (unchanged)
│   └── schemas.ts                             ← NEW: all Zod schemas + types
├── stores/
│   └── registerStore.ts                       ← NEW: Zustand store with persist
├── pages/
│   └── register/
│       ├── RegisterLayout.tsx                 ← NEW: shared layout with Outlet
│       └── StepGuard.tsx                      ← NEW: step access guard
└── components/
    ├── register/
    │   ├── RegisterStep1.tsx                  ← REFACTORED: RHF + Zod + Zustand
    │   ├── RegisterStep2.tsx                  ← REFACTORED: RHF + Zod + Zustand
    │   ├── RegisterStep3.tsx                  ← REFACTORED: RHF + Zod + Zustand
    │   └── ProgressIndicator.tsx              ← IMPLEMENTED
    └── ui/                                    (unchanged)
```
