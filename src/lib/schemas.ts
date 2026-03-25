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
