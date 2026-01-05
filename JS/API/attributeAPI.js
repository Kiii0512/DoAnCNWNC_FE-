import { apiFetchData } from "./http.js";

export async function getAttributes() {
  return apiFetchData("/attributes");
}
