import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { step3Schema, type Step3Data } from "@/lib/schemas";
import { useRegisterStore } from "@/stores/registerStore";
import {
	fetchProvinces,
	fetchRegencies,
	fetchDistricts,
	fetchVillages,
	type Province,
	type Regency,
	type District,
	type Village,
} from "@/lib/fetchAddress";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { selectClass } from "@/lib/utils";
import type {
	FieldError as RHFFieldError,
	UseFormRegisterReturn,
} from "react-hook-form";

type AddressOption = Province | Regency | District | Village;

type RegionSelectProps = {
	label: string;
	placeholder: string;
	options: AddressOption[];
	fieldError?: RHFFieldError;
} & UseFormRegisterReturn;

function RegionSelect({
	label,
	placeholder,
	options,
	fieldError,
	...registerProps
}: RegionSelectProps) {
	return (
		<Field>
			<FieldLabel>{label}</FieldLabel>
			<select {...registerProps} className={selectClass}>
				<option value="">{placeholder}</option>
				{options.map((o) => (
					<option key={o.code} value={o.code}>
						{o.name}
					</option>
				))}
			</select>
			<FieldError>{fieldError?.message}</FieldError>
		</Field>
	);
}

export default function RegisterStep3() {
	const navigate = useNavigate();
	const { step3: savedData, setStep3 } = useRegisterStore();

	const {
		register,
		handleSubmit,
		control,
		formState: { errors, isValid },
	} = useForm<Step3Data>({
		resolver: zodResolver(step3Schema),
		defaultValues: savedData,
		mode: "onChange",
	});

	const alamatValue = useWatch({ control, name: "alamatKTP" });
	const provinsiValue = useWatch({ control, name: "provinsi" });
	const kotaValue = useWatch({ control, name: "kotaKabupaten" });
	const kecamatanValue = useWatch({ control, name: "kecamatan" });

	const [provinces, setProvinces] = useState<Province[]>([]);
	const [regenciesByProvince, setRegenciesByProvince] = useState<
		Record<string, Regency[]>
	>({});
	const [districtsByRegency, setDistrictsByRegency] = useState<
		Record<string, District[]>
	>({});
	const [villagesByDistrict, setVillagesByDistrict] = useState<
		Record<string, Village[]>
	>({});

	const regencies = provinsiValue
		? (regenciesByProvince[provinsiValue] ?? [])
		: [];
	const districts = kotaValue ? (districtsByRegency[kotaValue] ?? []) : [];
	const villages = kecamatanValue
		? (villagesByDistrict[kecamatanValue] ?? [])
		: [];

	useEffect(() => {
		fetchProvinces()
			.then(setProvinces)
			.catch((err) => console.error("fetchProvinces error:", err));
	}, []);

	useEffect(() => {
		if (!provinsiValue || regenciesByProvince[provinsiValue]) return;
		fetchRegencies(provinsiValue)
			.then((data) =>
				setRegenciesByProvince((prev) => ({ ...prev, [provinsiValue]: data })),
			)
			.catch((err) => console.error("fetchRegencies error:", err));
	}, [provinsiValue]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		if (!kotaValue || districtsByRegency[kotaValue]) return;
		fetchDistricts(kotaValue)
			.then((data) =>
				setDistrictsByRegency((prev) => ({ ...prev, [kotaValue]: data })),
			)
			.catch((err) => console.error("fetchDistricts error:", err));
	}, [kotaValue]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		if (!kecamatanValue || villagesByDistrict[kecamatanValue]) return;
		fetchVillages(kecamatanValue)
			.then((data) =>
				setVillagesByDistrict((prev) => ({ ...prev, [kecamatanValue]: data })),
			)
			.catch((err) => console.error("fetchVillages error:", err));
	}, [kecamatanValue]); // eslint-disable-line react-hooks/exhaustive-deps

	const onSubmit = (data: Step3Data) => {
		setStep3(data);
		const { step1, step2 } = useRegisterStore.getState();
		const submission = { ...step1, ...step2, ...data };
		localStorage.setItem("register-submission", JSON.stringify(submission));
		navigate("/register/thank-you");
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
			<div className="flex flex-col gap-2">
				<h2 className="text-sm text-muted-foreground text-left">
					Informasi Data Diri
				</h2>
				<p
					className="self-start rounded-full border px-3 py-0.5 text-[12px]"
					style={{ borderColor: "#FFCF70" }}
				>
					3/3 Alamat Pribadi
				</p>
			</div>

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
					{(alamatValue ?? "").length}/225
				</p>
				<FieldError>{errors.alamatKTP?.message}</FieldError>
			</Field>

			<RegionSelect
				label="Provinsi"
				placeholder="Pilih provinsi"
				options={provinces}
				fieldError={errors.provinsi}
				{...register("provinsi")}
			/>
			<RegionSelect
				label="Kota / Kabupaten"
				placeholder="Pilih kota / kabupaten"
				options={regencies}
				fieldError={errors.kotaKabupaten}
				{...register("kotaKabupaten")}
			/>
			<RegionSelect
				label="Kecamatan"
				placeholder="Pilih kecamatan"
				options={districts}
				fieldError={errors.kecamatan}
				{...register("kecamatan")}
			/>
			<RegionSelect
				label="Kelurahan"
				placeholder="Pilih kelurahan"
				options={villages}
				fieldError={errors.kelurahan}
				{...register("kelurahan")}
			/>

			<Field>
				<FieldLabel>Kode Pos</FieldLabel>
				<Input
					{...register("kodePos")}
					placeholder="Masukkan kode pos"
					inputMode="numeric"
					maxLength={5}
				/>
				<FieldError>{errors.kodePos?.message}</FieldError>
			</Field>

			<Button type="submit" disabled={!isValid}>
				Daftar
			</Button>
		</form>
	);
}
