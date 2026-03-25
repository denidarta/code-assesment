import axios from "axios";

export type Province = {
	code: string;
	name: string;
};

export type Regency = {
	code: string;
	name: string;
};

export type District = {
	code: string;
	name: string;
};

export type Village = {
	code: string;
	name: string;
};

export async function fetchProvinces(): Promise<Province[]> {
	const response = await axios.get<{ data: Province[] }>(
		"/api/wilayah/provinces.json",
	);
	return response.data.data;
}

export async function fetchRegencies(provinceCode: string): Promise<Regency[]> {
	const response = await axios.get<{ data: Regency[] }>(
		`/api/wilayah/regencies/${provinceCode}.json`,
	);
	return response.data.data;
}

export async function fetchDistricts(regencyCode: string): Promise<District[]> {
	const response = await axios.get<{ data: District[] }>(
		`/api/wilayah/districts/${regencyCode}.json`,
	);
	return response.data.data;
}

export async function fetchVillages(districtCode: string): Promise<Village[]> {
	const response = await axios.get<{ data: Village[] }>(
		`/api/wilayah/villages/${districtCode}.json`,
	);
	return response.data.data;
}
