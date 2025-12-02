// ---------- Menu scroll behaviour (updated: active persists via location.hash) ----------
(function () {
    const wrap = document.getElementById('scrollWrap');
    const inner = document.getElementById('scrollInner');
    const left = document.getElementById('leftArrow');
    const right = document.getElementById('rightArrow');

    function updateArrows() {
        const maxScroll = inner.scrollWidth - wrap.clientWidth;
        if (maxScroll <= 2) {
            left.hidden = true;
            right.hidden = true;
            left.setAttribute('aria-hidden', 'true');
            right.setAttribute('aria-hidden', 'true');
            return;
        }
        if (wrap.scrollLeft <= 4) {
            left.hidden = true;
            left.setAttribute('aria-hidden', 'true');
        } else {
            left.hidden = false;
            left.removeAttribute('aria-hidden');
        }
        if (wrap.scrollLeft >= maxScroll - 4) {
            right.hidden = true;
            right.setAttribute('aria-hidden', 'true');
        } else {
            right.hidden = false;
            right.removeAttribute('aria-hidden');
        }
    }

    function doScroll(dir) {
        const step = Math.round(wrap.clientWidth * 0.7) || 200;
        const target = dir === 'right' ? Math.min(inner.scrollWidth - wrap.clientWidth, wrap.scrollLeft + step) : Math.max(0, wrap.scrollLeft - step);
        smoothScrollTo(wrap, target, 300);
    }

    function smoothScrollTo(elem, to, duration) {
        const start = elem.scrollLeft;
        const change = to - start;
        const startTime = performance.now();
        function animate(time) {
            const t = Math.min(1, (time - startTime) / duration);
            const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            elem.scrollLeft = Math.round(start + change * eased);
            if (t < 1) requestAnimationFrame(animate); else updateArrows();
        }
        requestAnimationFrame(animate);
    }

    right.addEventListener('click', (e) => { e.stopPropagation(); doScroll('right'); });
    left.addEventListener('click', (e) => { e.stopPropagation(); doScroll('left'); });

    right.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); right.click(); } });
    left.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); left.click(); } });

    window.addEventListener('resize', updateArrows);
    wrap.addEventListener('scroll', () => { window.requestAnimationFrame(updateArrows); });

    let startX = 0, isTouching = false;
    wrap.addEventListener('touchstart', e => { isTouching = true; startX = e.touches[0].clientX; });
    wrap.addEventListener('touchmove', e => { if (!isTouching) return; const dx = startX - e.touches[0].clientX; wrap.scrollLeft += dx; startX = e.touches[0].clientX; });
    wrap.addEventListener('touchend', () => { isTouching = false; updateArrows(); });

    // enhanced activation: supports location.hash persistence + click
    const menuItems = Array.from(document.querySelectorAll('.menu-item'));

    function setActiveElement(el) {
        menuItems.forEach(x => { x.classList.remove('active'); x.removeAttribute('aria-current'); });
        if (!el) return;
        el.classList.add('active');
        el.setAttribute('aria-current', 'page');
        // ensure visible inside scroll-wrap
        const wrapRect = wrap.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        if (elRect.left < wrapRect.left || elRect.right > wrapRect.right) {
            const target = Math.max(0, el.offsetLeft - Math.round(wrap.clientWidth * 0.14));
            smoothScrollTo(wrap, target, 300);
        }
        updateArrows();
    }

    menuItems.forEach(a => {
        a.setAttribute('tabindex', '0');
        a.addEventListener('click', (e) => {
            const href = a.getAttribute('href') || ''; if (href.startsWith('#')) { location.hash = href; }
            setActiveElement(a);
        });
        a.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); a.click(); } });
    });

    function setActiveFromLocation() {
        const hash = location.hash || '';
        let sel = null;
        if (hash) { sel = document.querySelector(`.menu-item[href="${hash}"]`) || document.querySelector(`.menu-item[data-route="${hash.replace('#', '')}"]`); }
       if(!sel) sel = document.querySelector('.menu-item[data-route="reports"]')
            || document.querySelector('.menu-item[href$="adminExport.html"]')
            || document.querySelector('.menu-item');
        setActiveElement(sel);
    }

    window.addEventListener('hashchange', setActiveFromLocation);
    window.addEventListener('load', () => { setActiveFromLocation(); updateArrows(); });
    setTimeout(() => { setActiveFromLocation(); updateArrows(); }, 160);
})();

/* ---------------- UI helpers and data ---------------- */
const KHOA_ADMIN = 'admin_donhang_demo';
function taiDon() { try { return JSON.parse(localStorage.getItem(KHOA_ADMIN)) || []; } catch (e) { return []; } }
function luuDon(arr) { localStorage.setItem(KHOA_ADMIN, JSON.stringify(arr)); }
function dinhVND(n) { return Number(n || 0).toLocaleString('vi-VN') + '₫' }
function showToast(msg, ms = 1400) { const t = document.getElementById('toast'); t.textContent = msg; t.style.display = 'block'; t.style.opacity = '1'; clearTimeout(t._t); t._t = setTimeout(() => { t.style.opacity = '0'; t.style.display = 'none'; }, ms); }

function todayISO() { return (new Date()).toISOString().slice(0, 10); }
function addDaysISO(iso, days) { const d = new Date(iso + 'T00:00:00'); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); }
function tinhTongDon(order) { if (!order || !Array.isArray(order.items)) return 0; return order.items.reduce((s, it) => s + (Number(it.price || it.gia || 0) * Number(it.qty || it.soLuong || 1)), 0); }

function pad(n) { return (n < 10 ? '0' + n : '' + n); }
function normalizeToISO(s) {
    if (!s) return null; s = String(s).trim();
    const mISO = s.match(/^(\d{4})[-\/](\d{2})[-\/](\d{2})$/); if (mISO) return `${mISO[1]}-${mISO[2]}-${mISO[3]}`;
    const m1 = s.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/); if (m1) { const a = parseInt(m1[1], 10), b = parseInt(m1[2], 10), y = m1[3]; if (a > 12) return `${y}-${pad(b)}-${pad(a)}`; if (b > 12) return `${y}-${pad(a)}-${pad(b)}`; return `${y}-${pad(b)}-${pad(a)}`; }
    const parsed = new Date(s); if (!isNaN(parsed.getTime())) { const y = parsed.getFullYear(); const m = pad(parsed.getMonth() + 1); const d = pad(parsed.getDate()); return `${y}-${m}-${d}`; } return null;
}
function formatDisplayDate(s) { const iso = normalizeToISO(s); if (!iso) return (s ? String(s).slice(0, 10) : '—'); const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}`; }
function orderDateISO(o) { if (!o || !o.ngay) return null; const iso = normalizeToISO(o.ngay); return iso; }

function sortOrdersByDateDesc(arr) { if (!Array.isArray(arr)) return []; return arr.slice().sort((a, b) => { const ai = orderDateISO(a); const bi = orderDateISO(b); const ta = ai ? new Date(ai + 'T00:00:00').getTime() : -8640000000000000; const tb = bi ? new Date(bi + 'T00:00:00').getTime() : -8640000000000000; return tb - ta; }); }
function filterTheoKhoang(orders, tuNgay, denNgay) { if (!tuNgay && !denNgay) return orders.slice(); const t = tuNgay ? new Date(tuNgay + 'T00:00:00').getTime() : -8640000000000000; const d = denNgay ? new Date(denNgay + 'T23:59:59').getTime() : 8640000000000000; return orders.filter(o => { const iso = orderDateISO(o); if (!iso) return false; const ngay = new Date(iso + 'T00:00:00').getTime(); return !isNaN(ngay) && ngay >= t && ngay <= d; }); }

function tinhDoanhThuTheoNgay(orders) {
    const map = {};
    orders.forEach(o => { const key = orderDateISO(o) || 'unknown'; const t = tinhTongDon(o); if (!map[key]) map[key] = 0; map[key] += t; });
    const arr = Object.keys(map).filter(k => k !== 'unknown').sort().map(k => ({ ngay: k, total: map[k] }));
    if (map['unknown']) arr.push({ ngay: 'unknown', total: map['unknown'] });
    return arr;
}

function capNhatKPI(orders) { const soDon = orders.length; const tong = orders.reduce((s, o) => s + tinhTongDon(o), 0); const tb = soDon ? Math.round(tong / soDon) : 0; document.getElementById('baoCaoTongDoanhThu').textContent = dinhVND(tong); document.getElementById('baoCaoSoDon').textContent = soDon; document.getElementById('baoCaoDonTB').textContent = dinhVND(tb); }

function renderBangDon(orders) {
    const tbody = document.querySelector('#bangBaoCao tbody'); tbody.innerHTML = '';
    orders.slice(0, 200).forEach(o => {
        const tr = document.createElement('tr'); const total = tinhTongDon(o);
        tr.innerHTML = `<td><strong>${o.id || '—'}</strong></td>
                        <td class="small muted">${formatDisplayDate(o.ngay)}</td>
                        <td>${(o.ten || '—')}<div class="small muted">${o.sdt || ''}</div></td>
                        <td style="font-weight:700">${dinhVND(total)}</td>
                        <td class="small muted">${(o.trangThai ? (o.trangThai === 'dang-cho' ? 'Đang chờ' : (o.trangThai === 'da-xac-nhan' ? 'Đã xác nhận' : o.trangThai)) : '—')}</td>`; tbody.appendChild(tr);
    });
    if (orders.length > 200) { const tr = document.createElement('tr'); tr.innerHTML = `<td colspan="5" class="small muted">Hiển thị 200 đơn đầu (trong tổng ${orders.length}).</td>`; tbody.appendChild(tr); }
}

/* ------- Responsive chart drawing ------- */
function drawChart(data, hoverIndex = -1) {
    const canvas = document.getElementById('bieuDo');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Calculate desired height based on parent width (responsive)
    const parent = canvas.parentElement || canvas;
    const parentWidth = Math.max(100, parent.clientWidth || parent.getBoundingClientRect().width || 600);
    const ratio = 0.42; // 42% of width
    const minH = 120;    // minimum height in px
    const desiredHeight = Math.max(minH, Math.round(parentWidth * ratio));

    canvas.style.width = '100%';
    canvas.style.height = desiredHeight + 'px';

    const DPR = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const cw = Math.max(1, Math.round(rect.width));
    const ch = Math.max(1, Math.round(rect.height));
    canvas.width = Math.round(cw * DPR);
    canvas.height = Math.round(ch * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    canvas._lastChartData = Array.isArray(data) ? data : [];

    ctx.clearRect(0, 0, cw, ch);

    if (!data || data.length === 0) {
        ctx.fillStyle = '#6b7280';
        ctx.font = '13px Inter, Arial';
        ctx.fillText('Không có dữ liệu trong khoảng chọn', 14, 40);
        canvas._chartState = { points: [], padding: 0, topPad: 0, bottomPad: 0, cw, ch };
        canvas._lastHoverIndex = -1;
        return;
    }

    const padding = 40;
    const topPad = 18;
    const bottomPad = 36;
    const chartW = cw - padding * 2;
    const chartH = ch - topPad - bottomPad;

    const vals = data.map(d => Number(d.total || 0));
    const max = Math.max(...vals, 1);

    // grid
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#f3f4f6';
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Inter, Arial';
    ctx.textBaseline = 'middle';

    const gridLevels = 3;
    for (let i = 0; i <= gridLevels; i++) {
        const y = topPad + (chartH * i / gridLevels);
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(cw - padding, y);
        ctx.strokeStyle = i === gridLevels ? '#e6e7eb' : '#f7f7f8';
        ctx.stroke();
        const labelVal = Math.round(max * (1 - i / gridLevels));
        ctx.fillStyle = '#9CA3AF';
        ctx.fillText(dinhVND(labelVal), 8, y);
    }

    const n = data.length;
    const gap = 10;
    const barWidth = Math.min(48, Math.max(8, Math.floor((chartW - (n - 1) * gap) / n)));
    const totalBarsWidth = barWidth * n + gap * (n - 1);
    const startX = padding + Math.round((chartW - totalBarsWidth) / 2);

    function roundRectFill(x, y, w, h, r, color) { const radius = Math.min(r, w / 2, h / 2); ctx.beginPath(); ctx.moveTo(x + radius, y); ctx.arcTo(x + w, y, x + w, y + h, radius); ctx.arcTo(x + w, y + h, x, y + h, radius); ctx.arcTo(x, y + h, x, y, radius); ctx.arcTo(x, y, x + w, y, radius); ctx.closePath(); ctx.fillStyle = color; ctx.fill(); }

    let x = startX;
    const points = [];
    for (let i = 0; i < n; i++) {
        const v = vals[i];
        const phan = v / max;
        const bh = Math.max(2, Math.round(chartH * phan));
        const yTop = topPad + (chartH - bh);

        ctx.fillStyle = 'rgba(2,6,23,0.04)';
        ctx.fillRect(x, yTop + bh + 4, barWidth, 4);

        const g = ctx.createLinearGradient(x, yTop, x, yTop + bh);
        g.addColorStop(0, 'rgba(13,110,253,0.95)');
        g.addColorStop(1, 'rgba(59,130,246,0.45)');

        const isHover = (i === hoverIndex);
        const drawBH = isHover ? Math.max(4, bh + 6) : bh;
        const drawYTop = isHover ? Math.max(topPad, yTop - 3) : yTop;

        roundRectFill(x, drawYTop, barWidth, drawBH, 6, g);

        points.push({ x: x + barWidth / 2, y: drawYTop + drawBH / 2, value: v, topY: drawYTop, height: drawBH, index: i });
        x += barWidth + gap;
    }

    // smooth line (optional)
    if (points.length >= 3 && points.length <= 20) {
        const drawPts = points.map(p => ({ x: p.x, y: topPad + (chartH - Math.round(chartH * (p.value / max))), value: p.value }));
        function catmullRom2bezier(points) {
            const d = [];
            for (let i = 0; i < points.length; i++) {
                const p0 = points[i - 1] || points[i];
                const p1 = points[i];
                const p2 = points[i + 1] || p1;
                const p3 = points[i + 2] || p2;
                const t = 0.25;
                const cp1x = p1.x + (p2.x - p0.x) * t;
                const cp1y = p1.y + (p2.y - p0.y) * t;
                const cp2x = p2.x - (p3.x - p1.x) * t;
                const cp2y = p2.y - (p3.y - p1.y) * t;
                d.push({ cp1x, cp1y, cp2x, cp2y, x: p2.x, y: p2.y });
            }
            return d;
        }
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(59,130,246,0.14)';
        ctx.beginPath();
        for (let i = 0; i < drawPts.length; i++) { const pt = drawPts[i]; if (i === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y); }
        ctx.stroke();

        const segs = catmullRom2bezier(drawPts);
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(drawPts[0].x, drawPts[0].y);
        for (let i = 0; i < segs.length; i++) {
            const s = segs[i];
            ctx.bezierCurveTo(s.cp1x, s.cp1y, s.cp2x, s.cp2y, s.x, s.y);
        }
        ctx.stroke();

        for (let i = 0; i < drawPts.length; i++) {
            const pt = drawPts[i];
            ctx.beginPath(); ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
            ctx.beginPath(); ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2); ctx.fillStyle = '#3B82F6'; ctx.fill();
        }
    }

    ctx.fillStyle = '#6b7280'; ctx.font = '12px Inter, Arial'; ctx.textAlign = 'center';
    let stepLabel = 1; if (n > 12) stepLabel = Math.ceil(n / 12);
    for (let i = 0; i < n; i++) {
        if (i % stepLabel !== 0) continue;
        const d = data[i];
        const iso = d.ngay || '';
        const txt = iso === 'unknown' ? '—' : (iso.length >= 10 ? (iso.slice(8, 10) + '/' + iso.slice(5, 7)) : iso);
        ctx.fillText(txt, points[i].x, ch - bottomPad + 16);
    }

    canvas._chartState = { points, padding, topPad, bottomPad, cw, ch };
    canvas._lastChartData = data || [];

    if (!canvas._hasChartListeners) {
        canvas._hasChartListeners = true;
        canvas._lastHoverIndex = -1;

        canvas.addEventListener('mousemove', function (e) {
            const rect = canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            const st = canvas._chartState;
            const dataNow = canvas._lastChartData || [];
            if (!st || !st.points || st.points.length === 0) return;

            let nearest = -1; let dist = 1e9;
            for (let i = 0; i < st.points.length; i++) {
                const p = st.points[i];
                const dx = Math.abs(p.x - mx); const dy = Math.abs(p.y - my);
                const d2 = Math.sqrt(dx * dx + dy * dy);
                if (d2 < dist) { dist = d2; nearest = i; }
            }

            if (dist <= 18) {
                if (canvas._lastHoverIndex !== nearest) {
                    canvas._lastHoverIndex = nearest;
                    drawChart(dataNow, nearest);
                }
            } else {
                if (canvas._lastHoverIndex !== -1) {
                    canvas._lastHoverIndex = -1;
                    drawChart(dataNow, -1);
                }
            }
        });

        canvas.addEventListener('mouseout', function () { canvas._lastHoverIndex = -1; drawChart(canvas._lastChartData || [], -1); });

        canvas.addEventListener('touchstart', function (e) {
            if (!canvas._chartState) return;
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const mx = touch.clientX - rect.left;
            const my = touch.clientY - rect.top;
            const st = canvas._chartState;
            const dataNow = canvas._lastChartData || [];
            if (!st || !st.points || st.points.length === 0) return;
            let nearest = -1; let dist = 1e9;
            for (let i = 0; i < st.points.length; i++) {
                const p = st.points[i];
                const dx = Math.abs(p.x - mx); const dy = Math.abs(p.y - my);
                const d2 = Math.sqrt(dx * dx + dy * dy);
                if (d2 < dist) { dist = d2; nearest = i; }
            }
            if (dist <= 22) { canvas._lastHoverIndex = nearest; drawChart(dataNow, nearest); }
            else { canvas._lastHoverIndex = -1; drawChart(dataNow, -1); }
        }, { passive: true });
    }

    if (typeof hoverIndex === 'number' && hoverIndex >= 0) {
        const st = canvas._chartState;
        if (st && st.points && st.points[hoverIndex]) {
            const p = st.points[hoverIndex];
            const txt = dinhVND(p.value);

            ctx.beginPath(); ctx.arc(p.x, p.topY, Math.max(8, Math.min(12, p.height / 4)), 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(59,130,246,0.12)'; ctx.fill();

            ctx.font = '12px Inter, Arial';
            const tw = Math.max(44, ctx.measureText(txt).width + 16);
            const th = 28;
            const tx = Math.min(cw - padding - tw, Math.max(p.x - tw / 2, padding));
            const ty = Math.max(6, p.topY - th - 10);
            const r = 8;
            ctx.fillStyle = 'rgba(17,24,39,0.95)';
            ctx.beginPath();
            ctx.moveTo(tx + r, ty);
            ctx.arcTo(tx + tw, ty, tx + tw, ty + th, r);
            ctx.arcTo(tx + tw, ty + th, tx, ty + th, r);
            ctx.arcTo(tx, ty + th, tx, ty, r);
            ctx.arcTo(tx, ty, tx + tw, ty, r);
            ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(txt, tx + tw / 2, ty + th / 2);
        }
    }
}

(function setupResizeHandling() {
    const canvas = document.getElementById('bieuDo');
    if (!canvas) return;
    if (window.ResizeObserver && !canvas._hasResizeObserver) {
        canvas._hasResizeObserver = true;
        try {
            const ro = new ResizeObserver(() => { if (canvas._lastChartData) drawChart(canvas._lastChartData, -1); });
            ro.observe(canvas.parentElement || canvas);
        } catch (e) { }
    }
    window.addEventListener('resize', () => { if (canvas._lastChartData) drawChart(canvas._lastChartData, -1); });
})();

/* ---------- Export helpers and UI bindings ---------- */
function exportCSV(rows, tenfile = 'bao_cao.csv') { if (!rows || rows.length === 0) { alert('Không có dữ liệu để xuất'); return; } const keys = ['id', 'ten', 'sdt', 'ngay', 'trangThai', 'tong', 'items']; const csv = [keys.join(',')]; rows.forEach(r => { const items = (r.items || []).map(i => `${(i.title || i.name || '').replace(/"/g, '""')} x${i.qty || i.soLuong || 1}`).join(' | '); const tot = tinhTongDon(r); const line = [r.id, r.ten, r.sdt, formatDisplayDate(r.ngay), r.trangThai, tot, `"${items.replace(/"/g, '""')}"`]; csv.push(line.map(c => ('' + c).replace(/\n/g, ' ').replace(/\r/g, '')).join(',')); }); const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = tenfile; document.body.appendChild(a); a.click(); URL.revokeObjectURL(url); a.remove(); showToast('Đã xuất CSV'); }
function exportPDFMock(rows, title = 'Báo cáo doanh thu') { const w = window.open('', '_blank'); const now = new Date().toLocaleString(); const rowsHtml = (rows || []).map(r => { const items = (r.items || []).map(i => `${i.title} x${i.qty || i.soLuong || 1}`).join('<br/>'); return `<tr>\n          <td>${r.id}</td><td>${formatDisplayDate(r.ngay)}</td><td>${r.ten}</td><td style="text-align:right">${(tinhTongDon(r)).toLocaleString('vi-VN')}₫</td><td>${r.trangThai}</td>\n        </tr>\n        <tr><td colspan="5" style="font-size:12px;color:#666;padding:6px 10px 12px 10px">Sản phẩm: ${items}</td></tr>`; }).join(''); const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>\n        <style>body{font-family:Arial,Helvetica,sans-serif;padding:20px}table{width:100%;border-collapse:collapse}td,th{padding:8px;border:1px solid #eee}h2{margin:0 0 10px}</style></head><body>\n        <h2>${title}</h2><div>Ngày xuất: ${now}</div>\n        <table><thead><tr><th>Mã</th><th>Ngày</th><th>Khách</th><th>Tổng</th><th>Trạng thái</th></tr></thead><tbody>${rowsHtml}</tbody></table>\n        <p style="margin-top:16px;font-size:13px;color:#666">(* Demo xuất PDF ở đây.Sau có DB thì chỉnh lại sau)</p>\n        </body></html>`; w.document.write(html); w.document.close(); w.focus(); setTimeout(() => { try { w.print(); } catch (e) { } }, 600); showToast('Mở hộp in — bạn có thể lưu thành PDF (mock)'); }

// UI bindings
function khoiTaoNgayMacDinh() { const ketThuc = todayISO(); const batDau = addDaysISO(ketThuc, -29); document.getElementById('ngayBatDau').value = batDau; document.getElementById('ngayKetThuc').value = ketThuc; }
function layDonDaLoc() { const arr = taiDon(); const tu = document.getElementById('ngayBatDau').value || null; const den = document.getElementById('ngayKetThuc').value || null; const filtered = filterTheoKhoang(arr, tu, den); return sortOrdersByDateDesc(filtered); }
function capNhatBaoCao() { const arr = layDonDaLoc(); capNhatKPI(arr); renderBangDon(arr); const data = tinhDoanhThuTheoNgay(arr); drawChart(data); }

document.getElementById('nutLoc').addEventListener('click', () => capNhatBaoCao());
document.getElementById('btnLamMoi').addEventListener('click', () => { renderFull(); showToast('Đã làm mới'); });
document.querySelectorAll('.filters button[data-range]').forEach(b => { b.addEventListener('click', (e) => { const v = b.dataset.range; const today = todayISO(); if (v === '7') { document.getElementById('ngayBatDau').value = addDaysISO(today, -6); document.getElementById('ngayKetThuc').value = today; } else if (v === '30') { document.getElementById('ngayBatDau').value = addDaysISO(today, -29); document.getElementById('ngayKetThuc').value = today; } else if (v === 'this-month') { const d = new Date(); const first = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10); document.getElementById('ngayBatDau').value = first; document.getElementById('ngayKetThuc').value = today; } else { document.getElementById('ngayBatDau').value = ''; document.getElementById('ngayKetThuc').value = ''; } capNhatBaoCao(); }); });
document.getElementById('btnXuatFilterCSV').addEventListener('click', () => { const arr = layDonDaLoc(); exportCSV(arr, 'bao_cao_loc.csv'); });
document.getElementById('btnXuatToanBoCSV').addEventListener('click', () => exportCSV(sortOrdersByDateDesc(taiDon()), 'bao_cao_toan_bo.csv'));
document.getElementById('btnXuatPDF').addEventListener('click', () => exportPDFMock(layDonDaLoc(), 'Báo cáo doanh thu (filter)'));

function renderFull() { if (!localStorage.getItem(KHOA_ADMIN)) { /* nothing - sample data may come from adminOrder */ } khoiTaoNgayMacDinh(); capNhatBaoCao(); }
renderFull();
