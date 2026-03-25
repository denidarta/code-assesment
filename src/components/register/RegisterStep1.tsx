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
