// JS/API/http.js
import { API_BASE_URL } from "../config.js";

export async function apiFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  const res = await fetch(url, {
    method: options.method || "GET",
    credentials: "include", //  cookie tự gửi
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await res.text();
  let json = null;
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
