import { z } from "zod";

export const JENIS_KELAMIN_OPTIONS = ["Laki-Laki", "Perempuan"] as const;

export const PENDIDIKAN_OPTIONS = [
	"SD",
	"SMP",
	"SMA",
	"Diploma",
	"Sarjana",
	"Magister",
	"Doktor",
] as const;

export const STATUS_PERNIKAHAN_OPTIONS = [
	"Belum Kawin",
	"Menikah",
	"Cerai",
] as const;

const phoneSchema = z
	.string()
	.regex(/^0\d{9,12}$/, "Masukkan nomor handphone yang valid");

export const step1Schema = z
	.object({
		nama: z.string().min(1, "Nama lengkap wajib diisi"),
		phone: phoneSchema,
		phoneAlt: phoneSchema,
		email: z.string().email("Format email tidak valid"),
	})
	.refine((d) => d.phone !== d.phoneAlt, {
		message: "Tidak boleh sama dengan nomor handphone utama",
		path: ["phoneAlt"],
	});

export const step2Schema = z.object({
	tempatLahir: z.string().min(1, "Tempat lahir wajib diisi"),
	tanggalLahir: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal lahir wajib diisi"),
	nomorKTP: z
		.string()
		.regex(/^\d{16}$/, "Nomor KTP harus tepat 16 digit angka"),
	jenisKelamin: z.enum(JENIS_KELAMIN_OPTIONS, {
		error: "Jenis kelamin wajib dipilih",
	}),
	pendidikanTerakhir: z.enum(PENDIDIKAN_OPTIONS, {
		error: "Pendidikan terakhir wajib dipilih",
	}),
	statusPernikahan: z.enum(STATUS_PERNIKAHAN_OPTIONS, {
		error: "Status pernikahan wajib dipilih",
	}),
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
	kodePos: z.string().regex(/^\d{5}$/, "Kode pos harus 5 digit angka"),
});

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
