import { showToast } from './toast.js';

export function exportCSV(rows, filename = 'export.csv'){
  if(!rows || rows.length === 0){
    alert('Không có dữ liệu để xuất');
    return;
  }

  const keys = Object.keys(rows[0]);
  const csv = [keys.join(',')];

  rows.forEach(r=>{
    csv.push(
      keys.map(k => `"${String(r[k] ?? '').replace(/"/g,'""')}"`).join(',')
    );
  });

  const blob = new Blob([csv.join('\n')], { type:'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  URL.revokeObjectURL(url);
  a.remove();

  showToast('Đã xuất CSV');
}
