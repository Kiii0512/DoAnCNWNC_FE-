const API_BASE = "https://localhost:7155/api/attributes";

export async function getAllAttributes() {
  try {
    const response = await fetch(API_BASE);
    if (!response.ok) throw new Error("Failed to fetch attributes");

    const json = await response.json();
    return json.data || [];
  } catch (error) {
    console.error("Error fetching attributes:", error);
    return [];
  }
}