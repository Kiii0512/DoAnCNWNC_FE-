/* Demo data and page rendering logic */
const MAU = [
  { id:'DH-1001', ten:'Nguyen Van A', sdt:'0912345678', phuongThuc:'Giao tận nơi', diaChi:'Hà Nội, Q1', ngay: offsetDateISO(-1), trangThai:'dang-cho', items:[{id:'p1',title:'iPhone 17 Pro',price:32990000,qty:1,img:''}]},
  { id:'DH-1002', ten:'Tran Thi B', sdt:'0987654321', phuongThuc:'Nhận tại cửa hàng', diaChi:'TP HCM, Q7', ngay: offsetDateISO(-3), trangThai:'da-xac-nhan', items:[{id:'p2',title:'AirPods Pro 2',price:4990000,qty:2,img:''}]},
  { id:'DH-1003', ten:'Le C', sdt:'0901122334', phuongThuc:'Giao tận nơi', diaChi:'Đà Nẵng', ngay: offsetDateISO(-6), trangThai:'da-gui', items:[{id:'p3',title:'Cáp Type-C',price:190000,qty:3,img:''}]}
];

function calcSummary(orders){
  const totalRevenue = orders.reduce((s,o)=> s + (o.items||[]).reduce((ss,it)=> ss + (Number(it.price||0) * Number(it.qty||1)),0), 0);
  const todayISO = (new Date()).toISOString().slice(0,10);
  const ordersToday = orders.filter(o => (o.ngay && o.ngay.slice(0,10) === todayISO)).length;
  const map = {};
  orders.forEach(o=> (o.items||[]).forEach(it=> { map[it.id || it.title] = (map[it.id||it.title] || {title: it.title || it.id, qty:0}); map[it.id||it.title].qty += Number(it.qty||1); }));
  const top = Object.values(map).sort((a,b)=> b.qty - a.qty).slice(0,3);
  return { totalRevenue, ordersToday, top, totalOrders: orders.length };
}

function renderKPIs(){
  const orders = taiDon();
  const summary = calcSummary(orders);
  const elRevenue = document.getElementById('kpiRevenueValue');
  const elOrders = document.getElementById('kpiOrdersValue');
  const elTop = document.getElementById('kpiTopProdValue');
  if(elRevenue) elRevenue.textContent = dinhVND(summary.totalRevenue);
  if(elOrders) elOrders.textContent = summary.ordersToday;
  if(elTop) elTop.textContent = summary.top.length ? summary.top[0].title : '—';
  const elTotalOrders = document.getElementById('summaryTotalOrders');
  const elTotalRevenue = document.getElementById('summaryTotalRevenue');
  if(elTotalOrders) elTotalOrders.textContent = summary.totalOrders;
  if(elTotalRevenue) elTotalRevenue.textContent = dinhVND(summary.totalRevenue);
  const elRevDelta = document.getElementById('kpiRevenueDelta');
  const elOrdDelta = document.getElementById('kpiOrdersDelta');
  const elTopDelta = document.getElementById('kpiTopProdDelta');
  if(elRevDelta) elRevDelta.textContent = '+4.5% vs tuần trước';
  if(elOrdDelta) elOrdDelta.textContent = '+2 đơn so với hôm qua';
  if(elTopDelta) elTopDelta.textContent = summary.top.length ? `${summary.top[0].qty} bán ra` : '—';
}

function renderRecentTable(){
  const tbody = document.querySelector('#recentTable tbody');
  if(!tbody) return;
  tbody.innerHTML = '';
  const arr = taiDon().slice().sort((a,b)=> new Date(b.ngay) - new Date(a.ngay)).slice(0,8);
  arr.forEach(o=>{
    const total = (o.items||[]).reduce((s,it)=> s + (Number(it.price||0) * Number(it.qty||1)), 0);
    const tr = document.createElement('tr');
    tr.innerHTML = `<td><strong>${o.id}</strong></td>
                    <td>${o.ten}<div class="small muted">${o.sdt||''}</div></td>
                    <td class="small muted">${o.ngay}</td>
                    <td style="font-weight:700">${dinhVND(total)}</td>
                    <td class="small muted">${o.trangThai || '—'}</td>`;
    tbody.appendChild(tr);
  });
}

/* Buttons & interactions */
document.addEventListener('click', function(e){
  // delegated handlers in case elements load later
});

/* Bind buttons after DOM loaded */
document.addEventListener('DOMContentLoaded', function(){
  const btnLamMoi = document.getElementById('btnLamMoi');
  if(btnLamMoi) btnLamMoi.addEventListener('click', ()=> { renderAll(); showToast('Đã làm mới'); });

  const btnExportCSV = document.getElementById('btnExportCSV');
  if(btnExportCSV) btnExportCSV.addEventListener('click', ()=> exportCSV(taiDon()));

  const btnCreate = document.getElementById('btnCreateMockOrder');
  if(btnCreate) btnCreate.addEventListener('click', ()=> {
    const arr = taiDon();
    const newId = 'DH-' + String(Math.floor(1000 + Math.random()*9000));
    const newOrder = {
      id: newId,
      ten: 'Khách demo ' + Math.floor(Math.random()*90+10),
      sdt: '09' + String(Math.floor(10000000 + Math.random()*89999999)),
      phuongThuc: 'Giao tận nơi',
      diaChi: 'Hà Nội',
      ngay: (new Date()).toISOString().slice(0,10),
      trangThai: 'dang-cho',
      items: [{ id:'p-demo', title:'Sản phẩm demo', price: 1990000, qty: Math.ceil(Math.random()*3), img:'' }]
    };
    arr.unshift(newOrder); luuDon(arr); renderAll(); showToast('Tạo đơn mock: ' + newId);
  });

  const btnClear = document.getElementById('btnClearMock');
  if(btnClear) btnClear.addEventListener('click', ()=> {
    if(confirm('Xóa toàn bộ dữ liệu local demo?')){ localStorage.removeItem(KHOA_ADMIN); renderAll(); showToast('Đã xóa dữ liệu demo'); }
  });

  const btnOpen = document.getElementById('btnOpenOrders');
  if(btnOpen) btnOpen.addEventListener('click', ()=> { window.location.href = 'adminOrder.html'; });

  const rangeSel = document.getElementById('rangeSelect');
  if(rangeSel) rangeSel.addEventListener('change', ()=> { drawRevenueChart(Number(rangeSel.value)); });

  const btnReloadChart = document.getElementById('btnReloadChart');
  if(btnReloadChart) btnReloadChart.addEventListener('click', ()=> { drawRevenueChart(Number(document.getElementById('rangeSelect').value)); drawDonutChart(); });

  // initialization
  if(!localStorage.getItem(KHOA_ADMIN)) luuDon(MAU.slice());
  renderAll();
});

/* top-level render */
function renderAll(){
  renderKPIs();
  renderRecentTable();
  drawRevenueChart(Number(document.getElementById('rangeSelect').value || 30));
  drawDonutChart();
}

/* expose for debugging */
window.renderAll = renderAll;
window.drawRevenueChart = drawRevenueChart;
window.drawDonutChart = drawDonutChart;
