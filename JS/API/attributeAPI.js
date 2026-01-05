const API_BASE = 'https://localhost:7155/api';

export async function getAttributes() {
  const res = await fetch(`${API_BASE}/attributes`);
  if (!res.ok) throw new Error('Load attributes failed');
  return (await res.json()).data;
}