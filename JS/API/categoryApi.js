const API_BASE = 'https://localhost:7155/api';

export async function getCategories() {
	const res = await fetch(`${API_BASE}/categories`);
	if (!res.ok) throw new Error('Load categories failed');
	const json = await res.json();
	return json?.data ?? json;
}

