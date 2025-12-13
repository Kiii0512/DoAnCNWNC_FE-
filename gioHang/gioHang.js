/* gioHang.js — phiên bản đã sửa: normalize item field names để tránh NaN */

// Khóa lưu localStorage cho demo
const KHOA = 'gio_demo_v1';

// Chờ DOM load trước khi thao tác DOM
document.addEventListener('DOMContentLoaded', () => {

  // Normalize 1 item: trả về object dùng chung { id, title, gia, soLuong, img, ... }
  function normalizeItem(raw) {
    // lấy qty: soLuong (VN) hoặc qty (EN) hoặc quantity
    const rawQty = raw?.soLuong ?? raw?.qty ?? raw?.quantity ?? raw?.count ?? 0;
    const soLuong = Math.max(0, Math.floor(Number(rawQty) || 0));

    // lấy price: gia (VN) hoặc price (EN) hoặc unitPrice
    const rawPrice = raw?.gia ?? raw?.price ?? raw?.unitPrice ?? raw?.amount ?? 0;
    // nếu rawPrice là chuỗi có dấu ., ₫, ký tự khác, loại bỏ trước khi Number
    const priceSanitized = (typeof rawPrice === 'string')
      ? Number(String(rawPrice).replace(/[^\d\-]/g, '')) // giữ dấu trừ nếu có
      : Number(rawPrice || 0);
    const gia = Number(isFinite(priceSanitized) ? priceSanitized : 0);

    return {
      id: raw?.id ?? raw?.productId ?? raw?.sku ?? '',
      title: raw?.title ?? raw?.name ?? '',
      img: raw?.img ?? raw?.thumbnail ?? '',
      gia,
      soLuong
      // giữ các trường thô nếu cần: ...raw
    };
  }

  // Hàm đọc giỏ hàng từ localStorage (trả về mảng đã chuẩn hoá)
  function taiGio(){
    try{
      const raw = JSON.parse(localStorage.getItem(KHOA)) || [];
      const norm = raw.map(r => normalizeItem(r));
      // Optional: persist normalized form back so we don't normalize repeatedly
      try { localStorage.setItem(KHOA, JSON.stringify(norm)); } catch(e){}
      return norm;
    } catch(e){
      return [];
    }
  }

  // Hàm lưu giỏ hàng vào localStorage và render lại giao diện
  function luuGio(gio){
    // đảm bảo lưu dưới định dạng chuẩn (gia: number, soLuong: number)
    const toSave = (gio || []).map(i => ({
      id: i.id,
      title: i.title,
      img: i.img,
      gia: Number(i.gia || 0),
      soLuong: Math.max(0, Math.floor(Number(i.soLuong) || 0))
    }));
    localStorage.setItem(KHOA, JSON.stringify(toSave));
    renderTatCa();
  }

  // Format số sang VND
  function dinhDangVND(n){ return Number(n || 0).toLocaleString('vi-VN') + '₫' }

  // Render toàn bộ (nội dung trang giỏ)
  function renderTatCa(){ const gio = taiGio(); renderNoiDung(gio); }

  // Render nội dung chính
  function renderNoiDung(gio){
    const el = document.getElementById('noidung');
    if(!el) return;

    if(!gio || gio.length===0){
      el.innerHTML = `
        <div class="gio-rong">
          <div class="ikon"> ... SVG ... </div>
          <h2>Giỏ hàng của bạn chưa có sản phẩm nào!</h2>
          <p>Hãy thêm sản phẩm vào giỏ để tiếp tục. Hỗ trợ: <a>0877781362</a> (08h00 - 22h00)</p>
        </div>
      `;
      return;
    }

    let htmlMatHang = '';
    let tong = 0;
    gio.forEach(it => {
      const qty = Number(it.soLuong) || 0;
      const unit = Number(it.gia) || 0;
      const tien = qty * unit;
      tong += tien;

      htmlMatHang += `
        <div class="hang-gio" data-id="${escapeHtml(it.id)}">
          <div class="anh"><img src="${escapeHtml(it.img)}" alt="${escapeHtml(it.title)}" style="max-width:100%;height:100%;object-fit:cover;border-radius:8px"/></div>
          <div class="thong-tin">
            <div class="tieu-de-item">${escapeHtml(it.title)}</div>
            <div class="meta-item">Mã: ${escapeHtml(it.id)} • ${dinhDangVND(unit)}</div>
          </div>
          <div style="text-align:right">
            <div class="dieu-khien-sl">
              <button class="giam" type="button">-</button>
              <input type="number" class="so-luong" min="1" value="${qty}" />
              <button class="tang" type="button">+</button>
            </div>
            <div style="margin-top:8px" class="gia">${dinhDangVND(tien)}</div>
            <div><button class="xoa" type="button">Xóa</button></div>
          </div>
        </div>
      `;
    });

    el.innerHTML = `
      <div class="luoi-gio">
        <div class="danh-sach-gio">
          <h2 style="margin:0 0 12px">Sản phẩm trong giỏ (${gio.length})</h2>
          ${htmlMatHang}
          <div style="padding:12px;color:var(--muted);font-size:13px">Bạn có thể thay đổi số lượng hoặc xóa sản phẩm.</div>
        </div>
        <aside class="tom-tat">
          <h3>Tóm tắt đơn hàng</h3>
          <div class="dong"><div>Tiền hàng</div><div>${dinhDangVND(tong)}</div></div>
          <div class="dong"><div>Phí giao hàng</div><div>Miễn phí</div></div>
          <div class="dong"><div>Ưu đãi</div><div>-0₫</div></div>
          <div class="dong" style="font-weight:700"><div>Tổng thanh toán</div><div>${dinhDangVND(tong)}</div></div>
          <div style="margin-top:12px">
            <input id="maGiamGia" placeholder="Mã khuyến mãi" style="width:100%;padding:10px;border-radius:8px;border:1px solid #e6e7eb" />
            <div class="thanh-toan">
              <button class="nut nut-chinh" id="nutThanhToan" type="button">Thanh toán</button>
              <button class="nut nut-ghost" id="tiepTucMua" type="button">Tiếp tục mua</button>
            </div>
          </div>
        </aside>
      </div>
    `;

    // Gán sự kiện cho từng item (tăng/giảm/sửa/xóa)
    document.querySelectorAll('.hang-gio').forEach(node => {
      const id = node.dataset.id;
      node.querySelector('.tang').addEventListener('click', ()=>thayDoiSoLuong(id,1));
      node.querySelector('.giam').addEventListener('click', ()=>thayDoiSoLuong(id,-1));
      node.querySelector('.so-luong').addEventListener('change', (e)=>datSoLuong(id, Math.max(1, parseInt(e.target.value)||1)));
      node.querySelector('.xoa').addEventListener('click', ()=>{ xoaMatHang(id) });
    });

    // Nút Thanh toán: lưu giỏ tạm (sessionStorage) rồi redirect sang trang thanh toán
    const btnThanhToan = document.getElementById('nutThanhToan');
    if(btnThanhToan){
      btnThanhToan.addEventListener('click', ()=>{
        const gio = taiGio();
        if(!gio || gio.length === 0){ alert('Giỏ hàng trống'); return; }
        try { sessionStorage.setItem('donHangTam', JSON.stringify(gio)); } catch(e){}
        window.location.href = 'thanhtoan.html';
      });
    }

    document.getElementById('tiepTucMua')?.addEventListener('click', ()=>{ window.location.href = '../home1/homee.html'; });
  }

  // Các hàm thao tác giỏ
  function themMatHang(pid, soLuong=1){
    // Nếu bạn dùng danhMuc demo: giữ nguyên. Nếu push object từ product page, gọi luuGio trực tiếp.
    const p = danhMuc.find(x=>x.id===pid);
    if(!p) return;
    const gio = taiGio();
    const found = gio.find(x=>x.id===pid);
    if(found) found.soLuong = Math.max(1, found.soLuong + soLuong);
    else gio.push({ id: p.id, title: p.title, gia: Number(p.gia || p.price || 0), img: p.img || '', soLuong: Math.max(1, soLuong) });
    luuGio(gio);
  }

  function thayDoiSoLuong(id, delta){
    const gio = taiGio();
    const it = gio.find(x=>x.id===id); if(!it) return;
    it.soLuong = Math.max(1, Number(it.soLuong || 0) + delta);
    luuGio(gio);
  }

  function datSoLuong(id, soLuong){
    const gio = taiGio(); const it = gio.find(x=>x.id===id); if(!it) return; it.soLuong = Math.max(1, parseInt(soLuong) || 1); luuGio(gio);
  }

  function xoaMatHang(id){
    let gio = taiGio(); gio = gio.filter(x=>x.id!==id); luuGio(gio);
  }

  function xoaToanBo(){ localStorage.removeItem(KHOA); renderTatCa(); }

  function thanhToan(){ const gio = taiGio(); if(gio.length===0){ alert('Giỏ hàng trống'); return } alert('Chức năng thanh toán demo — tổng: '+ dinhDangVND(gio.reduce((s,i)=>s + (Number(i.soLuong)||0) * (Number(i.gia)||0),0))); }

  // Header buttons (ở trang này btnGio là <a href="...">, không cần hành vi JS)
  const btnGio = document.getElementById('btnGio');
  if(btnGio){
    // nếu vẫn muốn scroll tới nội dung thay vì chuyển trang, bỏ comment bên dưới
    // btnGio.addEventListener('click', function(e){ e.preventDefault(); document.getElementById('noidung')?.scrollIntoView({behavior:'smooth'}); });
  }
  const btnTK = document.getElementById('btnTK');
  if(btnTK){
    btnTK.addEventListener('click', function(e){
      alert('Chức năng Tài khoản (demo)');
    });
  }

  // Utility: escape HTML (basic)
  function escapeHtml(s){ return String(s || '').replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; }); }

  // Demo danhMuc (bạn đã có sẵn) — giữ nguyên
  const danhMuc = [
    {id: 'p1', title: 'iPhone 17 Pro 256GB', gia: 32990000, img: 'images/iphone17.jpg'},
    {id: 'p2', title: 'AirPods Pro 2', gia: 4990000, img: 'images/airpodpro.jpg'},
    {id: 'p3', title: 'Cáp sạc Type-C', gia: 190000, img: 'https://via.placeholder.com/160x120?text=C%E1%BA%A1p'}
  ];

  // Khởi tạo demo: thêm một vài sản phẩm nếu giỏ rỗng 
  (function khoiTaoDemo(){
    const g = taiGio();
    if(g.length===0){
      themMatHang('p1',1);
      themMatHang('p2',2);
    } else renderTatCa();
  })();

}); // DOMContentLoaded end