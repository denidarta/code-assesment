import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import {
  step2Schema,
  type Step2Data,
  JENIS_KELAMIN_OPTIONS,
  PENDIDIKAN_OPTIONS,
  STATUS_PERNIKAHAN_OPTIONS,
} from "@/lib/schemas";
import { useRegisterStore } from "@/stores/registerStore";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50";

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
