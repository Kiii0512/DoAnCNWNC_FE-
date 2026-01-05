import { apiFetchData } from "./http.js";

function pickTotal(res) {
  const root = res?.data ?? res?.Data ?? res;
  const total = root?.total ?? root?.Total;
  return Number(total ?? 0);
}

export async function getRevenueByDay(dayISO) {
  const res = await apiFetchData(`/revenue/day?day=${encodeURIComponent(dayISO)}`);
  return pickTotal(res);
}

export async function getRevenueByMonth(year, month) {
  const res = await apiFetchData(
    `/revenue/month?year=${encodeURIComponent(year)}&month=${encodeURIComponent(month)}`
  );
  return pickTotal(res);
}