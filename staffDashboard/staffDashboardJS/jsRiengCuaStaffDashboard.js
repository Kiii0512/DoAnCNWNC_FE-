/* Chart drawing and tooltip logic for revenue + donut charts */

/* Revenue chart (bar + polyline) */
function drawRevenueChart(days = 30){
  const canvas = document.getElementById('revenueChart');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const parentW = canvas.parentElement.clientWidth || 600;
  canvas.style.width = '100%';
  const h = Math.max(160, Math.round(parentW * 0.38));
  canvas.style.height = h + 'px';
  const DPR = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width * DPR);
  canvas.height = Math.round(rect.height * DPR);
  ctx.setTransform(DPR,0,0,DPR,0,0);
  ctx.clearRect(0,0,rect.width,rect.height);

  const orders = taiDon();
  const map = {};
  for(let i=0;i<days;i++){
    const d = new Date(); d.setDate(d.getDate() - (days - 1 - i));
    const iso = d.toISOString().slice(0,10);
    map[iso]=0;
  }
  orders.forEach(o=>{
    const iso = (o.ngay || '').slice(0,10);
    if(iso in map){
      const t = (o.items||[]).reduce((s,it)=> s + (Number(it.price||0) * Number(it.qty||1)), 0);
      map[iso] += t;
    }
  });
  const keys = Object.keys(map);
  const vals = keys.map(k=> map[k]);
  const max = Math.max(...vals,1);

  const padding = 36; const topPad = 16; const bottomPad = 36;
  const cw = rect.width; const ch = rect.height;
  const chartW = cw - padding*2; const chartH = ch - topPad - bottomPad;

  ctx.lineWidth = 1; ctx.font = '12px Inter, Arial'; ctx.textBaseline='middle';
  for(let i=0;i<=3;i++){
    const y = topPad + chartH * i / 3;
    ctx.beginPath(); ctx.moveTo(padding, y); ctx.lineTo(cw - padding, y); ctx.strokeStyle = i===3 ? '#e6e7eb' : '#f7f7f8'; ctx.stroke();
    const labelVal = Math.round(max * (1 - i/3));
    ctx.fillStyle = '#9CA3AF';
    ctx.fillText(dinhVND(labelVal), 8, y);
  }

  const n = keys.length;
  const gap = 8;
  const barWidth = Math.min(48, Math.max(6, Math.floor((chartW - (n-1)*gap)/n)));
  const totalBarsWidth = barWidth*n + gap*(n-1);
  let x = padding + Math.round((chartW - totalBarsWidth)/2);

  const points = [];
  for(let i=0;i<n;i++){
    const v = vals[i];
    const hBar = Math.max(2, Math.round(chartH * (v / max)));
    const yTop = topPad + (chartH - hBar);
    ctx.fillStyle = 'rgba(2,6,23,0.04)'; ctx.fillRect(x, yTop + hBar + 4, barWidth, 4);
    const g = ctx.createLinearGradient(x, yTop, x, yTop + hBar);
    g.addColorStop(0, 'rgba(13,110,253,0.95)');
    g.addColorStop(1, 'rgba(59,130,246,0.45)');
    roundRectFill(ctx, x, yTop, barWidth, hBar, 6, g);
    points.push({x: x + barWidth/2, y: yTop + hBar/2, value: v, label: keys[i]});
    x += barWidth + gap;
  }

  if(points.length >= 2){
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(59,130,246,0.18)'; ctx.beginPath();
    points.forEach((p,i)=> { if(i===0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); }); ctx.stroke();
  }

  ctx.fillStyle = '#6b7280'; ctx.font = '12px Inter, Arial'; ctx.textAlign = 'center';
  const stepLabel = n > 12 ? Math.ceil(n/12) : 1;
  for(let i=0;i<n;i++){
    if(i % stepLabel !== 0) continue;
    const p = points[i];
    const lab = keys[i].slice(8,10) + '/' + keys[i].slice(5,7);
    ctx.fillText(lab, p.x, ch - bottomPad + 16);
  }

  canvas._chartState = { points, padding, topPad, bottomPad, cw, ch };
  canvas._lastData = { keys, vals };
  if(!canvas._hasListener){
    canvas._hasListener = true;
    canvas.addEventListener('mousemove', function(e){
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const st = canvas._chartState;
      if(!st) return;
      let nearest = -1; let dist = 1e9;
      for(let i=0;i<st.points.length;i++){
        const p = st.points[i];
        const dx = Math.abs(p.x - mx), dy = Math.abs(p.y - my); const d2 = Math.sqrt(dx*dx + dy*dy);
        if(d2 < dist){ dist = d2; nearest = i; }
      }
      if(dist <= 18){
        const p = st.points[nearest];
        drawRevenueChartHighlight(canvas, nearest);
        showChartTooltip(canvas, p, dinhVND(p.value));
      } else {
        drawRevenueChart(Number(document.getElementById('rangeSelect').value || 30));
        hideChartTooltip();
      }
    });
    canvas.addEventListener('mouseout', ()=> { drawRevenueChart(days); hideChartTooltip(); });
  }

  function roundRectFill(ctx,x,y,w,h,r,color){ const radius = Math.min(r,w/2,h/2); ctx.beginPath(); ctx.moveTo(x+radius,y); ctx.arcTo(x+w,y,x+w,y+h,radius); ctx.arcTo(x+w,y+h,x,y+h,radius); ctx.arcTo(x,y+h,x,y,radius); ctx.arcTo(x,y,x+w,y,radius); ctx.closePath(); ctx.fillStyle = color; ctx.fill(); }
}

function drawRevenueChartHighlight(canvas, hoverIndex){
  // For now just redraw full chart; highlight logic could be extended here.
  drawRevenueChart(Number(document.getElementById('rangeSelect').value || 30));
}

let __chartTooltip = null;
function showChartTooltip(canvas, point, text){
  if(!__chartTooltip){
    __chartTooltip = document.createElement('div');
    __chartTooltip.style.position='fixed';
    __chartTooltip.style.background='rgba(0,0,0,0.85)';
    __chartTooltip.style.color='#fff';
    __chartTooltip.style.padding='6px 8px';
    __chartTooltip.style.borderRadius='8px';
    __chartTooltip.style.fontSize='13px';
    __chartTooltip.style.zIndex=9999;
    document.body.appendChild(__chartTooltip);
  }
  const rect = canvas.getBoundingClientRect();
  __chartTooltip.textContent = text;
  const left = Math.min(window.innerWidth - 120, rect.left + point.x + 8);
  const top = rect.top + point.y - 28;
  __chartTooltip.style.left = (left) + 'px';
  __chartTooltip.style.top = (top) + 'px';
  __chartTooltip.style.display = 'block';
}
function hideChartTooltip(){ if(__chartTooltip) __chartTooltip.style.display = 'none'; }

/* Donut chart for top products */
function drawDonutChart(){
  const canvas = document.getElementById('donutChart');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');

  canvas.style.width = '100%';
  const parentW = canvas.parentElement.clientWidth || 260;
  const h = Math.max(140, Math.round(parentW * 0.7));
  canvas.style.height = h + 'px';
  const DPR = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width * DPR);
  canvas.height = Math.round(rect.height * DPR);
  ctx.setTransform(DPR,0,0,DPR,0,0);
  ctx.clearRect(0,0,rect.width,rect.height);

  const orders = taiDon();
  const map = {};
  orders.forEach(o=> (o.items||[]).forEach(it=> { const key = it.title || it.id; map[key] = (map[key] || 0) + Number(it.qty||1); }));
  const items = Object.keys(map).map(k=> ({ label:k, value: map[k] })).sort((a,b)=> b.value - a.value).slice(0,6);
  const total = items.reduce((s,it)=> s + it.value, 0) || 1;

  const cx = rect.width / 2;
  const cy = rect.height / 2;
  const radius = Math.min(rect.width, rect.height) * 0.28;
  const innerRadius = radius * 0.55;

  let start = -Math.PI/2;
  const colors = ['#3B82F6','#0EA5A4','#F59E0B','#EF4444','#7C3AED','#16A34A'];
  items.forEach((it,idx)=> {
    const ang = (it.value/total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx,cy);
    ctx.arc(cx,cy, radius, start, start + ang);
    ctx.closePath();
    ctx.fillStyle = colors[idx % colors.length];
    ctx.fill();
    start += ang;
  });

  ctx.beginPath(); ctx.fillStyle = '#fff'; ctx.arc(cx,cy, innerRadius, 0, Math.PI*2); ctx.fill();

  ctx.fillStyle = '#111'; ctx.font = '13px Inter, Arial'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('Top sản phẩm', cx, cy - 8);
  ctx.font = 'bold 14px Inter, Arial'; ctx.fillText(String(total) + ' items', cx, cy + 14);

  const legendWrap = document.getElementById('donutLegend');
  if(legendWrap){
    legendWrap.innerHTML = '';
    items.forEach((it, idx) => {
      const div = document.createElement('div'); div.className = 'legend-item';
      const sw = document.createElement('span'); sw.className='legend-swatch'; sw.style.background = colors[idx % colors.length];
      const label = document.createElement('div'); label.innerHTML = `<div style="font-weight:700">${it.label}</div><div class="small muted">${it.value} bán</div>`;
      div.appendChild(sw); div.appendChild(label);
      legendWrap.appendChild(div);
    });
  }
}

/* responsive redraw */
(function setupResponsiveCharts(){
  const donutCanvas = document.getElementById('donutChart');
  const revenueCanvas = document.getElementById('revenueChart');

  const safeRedraw = debounce(()=> {
    try { drawDonutChart(); } catch(e){ console.warn(e); }
    try { drawRevenueChart(Number(document.getElementById('rangeSelect').value || 30)); } catch(e){ console.warn(e); }
  }, 160);

  window.addEventListener('resize', safeRedraw);

  try {
    const ro = new ResizeObserver(safeRedraw);
    if(donutCanvas && donutCanvas.parentElement) ro.observe(donutCanvas.parentElement);
    if(revenueCanvas && revenueCanvas.parentElement) ro.observe(revenueCanvas.parentElement);
  } catch(e){
    // fallback
  }
})();
