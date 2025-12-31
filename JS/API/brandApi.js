const API_BASE = 'https://localhost:7155/api';

export async function getBrands() {
	const res = await fetch(`${API_BASE}/brands`);
	if (!res.ok) throw new Error('Load brands failed');
	const json = await res.json();
	return json?.data ?? json;
}
