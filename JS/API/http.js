// JS/API/http.js
import { API_BASE_URL } from "../config.js";

export async function apiFetch(path, options = {}) {
  const url = path.startsWith("http")
    ? path
    : `${API_BASE_URL}${path}`;

  const headers = { ...(options.headers || {}) };

  let body = options.body;

  // ✅ Chỉ set JSON khi body là object thường
  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] =
      headers["Content-Type"] || "application/json";
    body = JSON.stringify(body);
  }

  const res = await fetch(url, {
    method: options.method || "GET",
    credentials: "include", // 🔑 HttpOnly cookie
    headers,
    body,
  });

  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }

  if (!res.ok) {
    const msg =
      (json && (json.message || json.Message)) ||
      (typeof json === "string" && json) ||
      `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return json;
}

export async function apiFetchData(path, options = {}) {
  const json = await apiFetch(path, options);
  if (json && typeof json === "object") {
    return json.data ?? json.Data ?? json;
  }
  return json;
}
