// API for attributes
const API_BASE = "https://localhost:7155/api/attributes";

/**
 * Get all attributes
 */
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

/**
 * Get attribute by ID
 */
export async function getAttributeById(attributeId) {
  try {
    const response = await fetch(`${API_BASE}/${attributeId}`);
    if (!response.ok) throw new Error("Failed to fetch attribute");

    const json = await response.json();
    return json.data || null;
  } catch (error) {
    console.error("Error fetching attribute:", error);
    return null;
  }
}

