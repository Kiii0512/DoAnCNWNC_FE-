export function dinhVND(n){
  return Number(n || 0).toLocaleString('vi-VN') + '₫';
}

export function offsetDateISO(offsetDays){
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}
