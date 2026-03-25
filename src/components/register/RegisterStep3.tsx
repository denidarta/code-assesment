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
          maxLength={5}
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
