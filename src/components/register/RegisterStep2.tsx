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
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { selectClass } from "@/lib/utils";

export default function RegisterStep2() {
	const navigate = useNavigate();
	const { step2: savedData, setStep2 } = useRegisterStore();

	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm<Step2Data>({
		resolver: zodResolver(step2Schema),
		defaultValues: savedData,
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
			<div className="flex flex-col gap-2">
				<h2 className="text-sm text-muted-foreground text-left">
					Informasi Data Diri
				</h2>
				<p
					className="self-start rounded-full border px-3 py-0.5 text-[12px]"
					style={{ borderColor: "#FFCF70" }}
				>
					2/3 Informasi Lanjutan
				</p>
			</div>

			<Field>
				<FieldLabel>Tempat Lahir</FieldLabel>
				<Input
					{...register("tempatLahir")}
					placeholder="Masukkan tempat lahir"
				/>
				<FieldError>{errors.tempatLahir?.message}</FieldError>
			</Field>

			<Field>
				<FieldLabel>Tanggal Lahir</FieldLabel>
				<Input {...register("tanggalLahir")} type="date" />
				<FieldError>{errors.tanggalLahir?.message}</FieldError>
			</Field>

			<Field>
				<FieldLabel>Nomor KTP</FieldLabel>
				<Input
					{...register("nomorKTP")}
					placeholder="16 digit nomor KTP"
					maxLength={16}
					inputMode="numeric"
				/>
				<FieldError>{errors.nomorKTP?.message}</FieldError>
			</Field>

			<Field>
				<FieldLabel>Jenis Kelamin</FieldLabel>
				<select {...register("jenisKelamin")} className={selectClass}>
					<option value="">Pilih jenis kelamin</option>
					{JENIS_KELAMIN_OPTIONS.map((o) => (
						<option key={o} value={o}>
							{o}
						</option>
					))}
				</select>
				<FieldError>{errors.jenisKelamin?.message}</FieldError>
			</Field>

			<Field>
				<FieldLabel>Pendidikan Terakhir</FieldLabel>
				<select {...register("pendidikanTerakhir")} className={selectClass}>
					<option value="">Pilih pendidikan terakhir</option>
					{PENDIDIKAN_OPTIONS.map((o) => (
						<option key={o} value={o}>
							{o}
						</option>
					))}
				</select>
				<FieldError>{errors.pendidikanTerakhir?.message}</FieldError>
			</Field>

			<Field>
				<FieldLabel>Status Pernikahan</FieldLabel>
				<select {...register("statusPernikahan")} className={selectClass}>
					<option value="">Pilih status pernikahan</option>
					{STATUS_PERNIKAHAN_OPTIONS.map((o) => (
						<option key={o} value={o}>
							{o}
						</option>
					))}
				</select>
				<FieldError>{errors.statusPernikahan?.message}</FieldError>
			</Field>

			<Field>
				<FieldLabel>Nama Ibu Kandung</FieldLabel>
				<Input
					{...register("namaIbuKandung")}
					placeholder="Masukkan nama ibu kandung"
				/>
				<FieldError>{errors.namaIbuKandung?.message}</FieldError>
			</Field>

			<Button type="submit" disabled={!isValid}>
				Selanjutnya
			</Button>
		</form>
	);
}
