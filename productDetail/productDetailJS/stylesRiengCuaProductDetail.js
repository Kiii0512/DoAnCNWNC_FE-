/* Page-specific logic for productDetail (renders product, variants, gallery, cart ops) */

/* Runtime product object */
let SAN_PHAM = null;

/* Elements references */
const galleryThumbs = document.getElementById('galleryThumbs');
const hinhChinh = document.getElementById('hinhChinh');
const lightbox = document.getElementById('lightbox');
const lightboxImg = lightbox.querySelector('img');

const khungDungLuong = document.getElementById('khungDungLuong');
const khungMauSac = document.getElementById('khungMauSac');
const elTitle = document.getElementById('chiTietTitle');
const elMa = document.getElementById('maSanPham');
const elMoTa = document.getElementById('moTa');
const elBangThongSoChinh = document.getElementById('bangThongSo');
const elThongSoFull = document.getElementById('thongSoDayDu');
const elTinhTrang = document.getElementById('tinhTrangKho');
const elGiaChinh = document.getElementById('giaChinh');
const elGiaCu = document.getElementById('giaCu');
const elBadge = document.getElementById('badgeGiam');

let selectedOptions = { capacity: null, color: null };

/* Gallery & Lightbox */
function renderGallery(prod){
  galleryThumbs.innerHTML = '';
  const imgs = (prod && prod.hinh) ? prod.hinh.slice() : [];
  imgs.forEach((src, idx)=>{
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-label','Xem ảnh ' + (idx+1));
    btn.innerHTML = `<img src="${src}" alt="ảnh ${idx+1}">`;
    btn.addEventListener('click', ()=>{ setMainImage(src); });
    galleryThumbs.appendChild(btn);
  });
  setMainImage(imgs[0] || '');
}
function setMainImage(src){
  hinhChinh.src = src || '';
  hinhChinh.alt = SAN_PHAM ? SAN_PHAM.ten : 'Hình sản phẩm';
  lightboxImg.src = src || '';
}
hinhChinh.addEventListener('click', ()=> { if(!hinhChinh.src) return; lightbox.classList.add('open'); lightbox.setAttribute('aria-hidden','false'); });
lightbox.addEventListener('click', (e)=> { if(e.target === lightbox || e.target === lightboxImg) { lightbox.classList.remove('open'); lightbox.setAttribute('aria-hidden','true'); } });

/* Options & variants */
function findVariantByOptions(opts){
  if(!SAN_PHAM || !SAN_PHAM.variants || !SAN_PHAM.variants.length) return null;
  return SAN_PHAM.variants.find(v => v.capacity === opts.capacity && v.color === opts.color) || SAN_PHAM.variants[0];
}

function renderOptionButtons(){
  khungDungLuong.innerHTML = '';
  khungMauSac.innerHTML = '';
  if(!SAN_PHAM || !SAN_PHAM.variants || !SAN_PHAM.variants.length) return;

  const caps = [...new Set(SAN_PHAM.variants.map(v=>v.capacity).filter(Boolean))];
  caps.forEach(cap => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option-btn small';
    btn.textContent = cap;
    btn.dataset.value = cap;
    btn.addEventListener('click', ()=> {
      selectedOptions.capacity = cap;
      const variant = findVariantByOptions(selectedOptions);
      if(!variant) {
        const found = SAN_PHAM.variants.find(v=> v.capacity === cap);
        if(found) selectedOptions.color = found.color;
      }
      refreshOptionActiveStates();
      capNhatGiaVaKho();
    });
    khungDungLuong.appendChild(btn);
  });

  const colorMap = {};
  SAN_PHAM.variants.forEach(v => { if(v.color) colorMap[v.color] = v.colorHex || '#cccccc'; });
  Object.keys(colorMap).forEach(col => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option-btn option-color';
    btn.dataset.value = col;
    const sw = document.createElement('span'); sw.className = 'swatch'; sw.style.background = colorMap[col]; sw.setAttribute('aria-hidden','true');
    const label = document.createElement('span'); label.textContent = col;
    btn.appendChild(sw); btn.appendChild(label);
    btn.addEventListener('click', ()=> {
      selectedOptions.color = col;
      const variant = findVariantByOptions(selectedOptions);
      if(!variant) {
        const found = SAN_PHAM.variants.find(v=> v.color === col);
        if(found) selectedOptions.capacity = found.capacity;
      }
      refreshOptionActiveStates();
      capNhatGiaVaKho();
    });
    khungMauSac.appendChild(btn);
  });

  if(SAN_PHAM.variants && SAN_PHAM.variants.length){
    selectedOptions.capacity = selectedOptions.capacity || SAN_PHAM.variants[0].capacity;
    selectedOptions.color = selectedOptions.color || SAN_PHAM.variants[0].color;
  }
  refreshOptionActiveStates();
}

function refreshOptionActiveStates(){
  document.querySelectorAll('#khungDungLuong .option-btn').forEach(b => b.classList.toggle('active', b.dataset.value === selectedOptions.capacity));
  document.querySelectorAll('#khungMauSac .option-btn').forEach(b => b.classList.toggle('active', b.dataset.value === selectedOptions.color));
}

/* Specs rendering */
const MAIN_SPEC_KEYS = [
  'Công nghệ màn hình',
  'Độ phân giải màn hình',
  'Camera',
  'Hệ điều hành & CPU',
  'Bộ nhớ trong',
  'Pin'
];

function renderMainSpecs(){
  elBangThongSoChinh.innerHTML = '';
  if(!SAN_PHAM || !Array.isArray(SAN_PHAM.specs)) return;

  const specs = SAN_PHAM.specs.slice();
  const used = new Set();
  const ordered = [];

  MAIN_SPEC_KEYS.forEach(key=>{
    const idx = specs.findIndex(s => String(s[0]).trim().toLowerCase() === key.trim().toLowerCase());
    if(idx !== -1){
      ordered.push(specs[idx]);
      used.add(String(specs[idx][0]).trim().toLowerCase());
    }
  });

  specs.forEach(s=>{
    if(!used.has(String(s[0]).trim().toLowerCase())){
      ordered.push(s);
    }
  });

  ordered.forEach(s=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<th>${s[0]}</th><td>${s[1]}</td>`;
    elBangThongSoChinh.appendChild(tr);
  });
}

function renderFullSpecs(){
  elThongSoFull.innerHTML = '';
  if(!SAN_PHAM || !Array.isArray(SAN_PHAM.specs)) return;
  SAN_PHAM.specs.forEach(s=>{
    const p = document.createElement('div');
    p.innerHTML = `<p style="margin:6px 0"><strong>${s[0]}:</strong> ${s[1]}</p>`;
    elThongSoFull.appendChild(p);
  });
}

/* Price & stock */
function capNhatGiaVaKho(){
  const variant = findVariantByOptions(selectedOptions) || {};
  const price = (SAN_PHAM ? SAN_PHAM.giaGoc : 0) + (variant.priceDelta || 0);
  elGiaChinh.textContent = dinhVND(price);
  if(SAN_PHAM && SAN_PHAM.giaGoc && SAN_PHAM.giaGoc > price){
    elGiaCu.style.display = 'inline-block'; elGiaCu.textContent = dinhVND(SAN_PHAM.giaGoc);
    const pct = Math.round((SAN_PHAM.giaGoc - price) / SAN_PHAM.giaGoc * 100);
    elBadge.textContent = '-' + pct + '%'; elBadge.style.display = 'inline-block';
  } else { elGiaCu.style.display = 'none'; elBadge.style.display = 'none'; }
  const stock = variant ? (variant.stock || 0) : 0;
  const statusEl = stock > 0 ? `<span class="in-stock">Còn hàng (${stock})</span>` : `<span class="out-stock">Hết hàng</span>`;
  elTinhTrang.innerHTML = 'Tình trạng: ' + statusEl;
  if(variant && variant.img) setMainImage(variant.img);
  updateSummary(); updateStickyBar();
}

/* Quantity & summary */
const btnMinus = document.getElementById('btnMinus');
const btnPlus = document.getElementById('btnPlus');
const inputSoLuong = document.getElementById('soLuong');
const sumGia = document.getElementById('sumGia');
const sumSoLuong = document.getElementById('sumSoLuong');
const sumTong = document.getElementById('sumTong');

btnMinus.addEventListener('click', ()=>{ let v = Number(inputSoLuong.value) || 1; if(v>1) v--; inputSoLuong.value = v; updateSummary(); });
btnPlus.addEventListener('click', ()=>{ let v = Number(inputSoLuong.value) || 1; v++; inputSoLuong.value = v; updateSummary(); });
inputSoLuong.addEventListener('change', ()=>{ let v = Number(inputSoLuong.value) || 1; if(v<1) v=1; inputSoLuong.value=v; updateSummary(); });

function updateSummary(){
  const variant = findVariantByOptions(selectedOptions) || {};
  const price = (SAN_PHAM ? SAN_PHAM.giaGoc : 0) + (variant.priceDelta || 0);
  const qty = Math.max(1, Number(inputSoLuong.value) || 1);
  sumGia.textContent = dinhVND(price);
  sumSoLuong.textContent = qty;
  sumTong.textContent = dinhVND(price * qty);
  const stock = variant ? (variant.stock || 0) : 0;
  const nut = document.getElementById('nutThemVaoGio');
  nut.disabled = (stock <= 0 || qty > stock);
}

/* Cart operations */
document.getElementById('nutThemVaoGio').addEventListener('click', ()=>{ themVaoGio(); });
function themVaoGio(){
  const qty = Math.max(1, Number(inputSoLuong.value) || 1);
  const variant = findVariantByOptions(selectedOptions) || {};
  if(variant && variant.stock !== undefined && variant.stock <= 0){ showToast('Sản phẩm hiện hết hàng'); return; }
  if(variant && variant.stock !== undefined && qty > variant.stock){ showToast('Số lượng vượt quá tồn kho'); return; }
  const gio = taiGio();
  const existIndex = gio.findIndex(i=> i.id=== (SAN_PHAM?SAN_PHAM.id: null) && i.variantId=== (variant?variant.id: null));
  if(existIndex !== -1) gio[existIndex].qty = (gio[existIndex].qty||0) + qty;
  else gio.push({
    id: SAN_PHAM.id,
    productId: SAN_PHAM.id,
    variantId: variant && variant.id,
    title: SAN_PHAM.ten + (variant ? (' - ' + (variant.capacity||'') + ' / ' + (variant.color||'')) : ''),
    price: (SAN_PHAM.giaGoc + (variant.priceDelta||0)),
    qty,
    img: variant && variant.img || (SAN_PHAM.hinh && SAN_PHAM.hinh[0])
  });
  luuGio(gio); showToast('Đã thêm vào giỏ');
}

document.getElementById('nutMuaNgay').addEventListener('click', ()=> {
  themVaoGio();
  showToast('Chuyển tới trang thanh toán (demo)');
  setTimeout(()=> { window.location.href = 'thanhtoan.html'; }, 700);
});

function renderLienQuan(){
  const wrap = document.getElementById('sanPhamLienQuan');
  wrap.innerHTML = '';
  if(!SAN_PHAM || !SAN_PHAM.related) return;
  SAN_PHAM.related.forEach(p=>{
    const d = document.createElement('div');
    d.className = 'card-lq';
    d.innerHTML = `<img src="${p.img}" alt="${p.ten}"><div class="t">${p.ten}</div><div class="p">${dinhVND(p.gia)}</div><button class="nut nut-ghost" data-id="${p.id}">Thêm</button>`;
    const btn = d.querySelector('button');
    btn.addEventListener('click', ()=>{
      const gio = taiGio();
      const existing = gio.find(x=> x.id === p.id);
      if(existing) existing.qty = (existing.qty||0) + 1;
      else gio.push({ id: p.id, title: p.ten, price: p.gia, qty:1, img: p.img });
      luuGio(gio);
      showToast('Đã thêm: ' + p.ten);
    });
    wrap.appendChild(d);
  });
}

/* Tabs, offers, sticky, badge */
document.querySelectorAll('.product-tabs [role="tab"]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.product-tabs [role="tab"]').forEach(b=>b.setAttribute('aria-selected', false));
    btn.setAttribute('aria-selected', true);
    document.querySelectorAll('.tab-panel').forEach(p=> p.hidden = true);
    document.getElementById('tab-' + btn.dataset.tab).hidden = false;
  });
});

const btnUuDai = document.getElementById('btnUuDai');
const panelUuDai = document.getElementById('panelUuDai');
if(btnUuDai){
  btnUuDai.addEventListener('click', ()=>{
    const open = panelUuDai.style.display === 'block';
    panelUuDai.style.display = open ? 'none' : 'block';
  });
}

const btnThanhToan = document.getElementById('btnThanhToan');
if(btnThanhToan){
  btnThanhToan.addEventListener('click', ()=>{
    themVaoGio();
    showToast('Chuyển tới trang thanh toán (demo)');
    setTimeout(()=> { window.location.href = 'thanhtoan.html'; }, 700);
  });
}

/* Sticky buybar update */
function updateStickyBar(){
  const bar = document.getElementById('stickyBuybar');
  const thumb = document.getElementById('stickyThumb');
  const name = document.getElementById('stickyName');
  const price = document.getElementById('stickyPrice');
  const variant = findVariantByOptions(selectedOptions) || {};
  if(!SAN_PHAM) return;
  thumb.src = variant.img || SAN_PHAM.hinh[0] || '';
  name.textContent = SAN_PHAM.ten + (variant.capacity ? ' - ' + variant.capacity : '');
  price.textContent = dinhVND((SAN_PHAM.giaGoc || 0) + (variant.priceDelta || 0));
}
window.addEventListener('scroll', ()=>{ const y = window.scrollY; const bar = document.getElementById('stickyBuybar'); if(y > 380 && window.innerWidth < 980) bar.style.display = 'flex'; else bar.style.display = 'none'; });
document.getElementById('stickyBuy').addEventListener('click', ()=>{ document.getElementById('nutMuaNgay').click(); });

/* Accessibility: thumbnails keyboard */
if(galleryThumbs){
  galleryThumbs.addEventListener('keydown', (e)=>{ const foc = document.activeElement; if(e.key === 'ArrowRight' || e.key==='ArrowDown'){ e.preventDefault(); if(foc.nextElementSibling) foc.nextElementSibling.focus(); } if(e.key === 'ArrowLeft' || e.key==='ArrowUp'){ e.preventDefault(); if(foc.previousElementSibling) foc.previousElementSibling.focus(); } });
}

/* Header alias mapping (compatibility for other header versions) */
(function aliasHeaderIds(){
  if(!document.getElementById('btnGio') && document.getElementById('cartBtn')){
    const cartBtn = document.getElementById('cartBtn');
    const alias = document.createElement('a');
    alias.id = 'btnGio';
    alias.href = '#';
    alias.style.display = 'none';
    document.body.appendChild(alias);
    alias.addEventListener('click', (e)=> { e.preventDefault(); cartBtn.click(); });
  }
  if(!document.getElementById('btnTK') && document.getElementById('taikhoan')){
    const accBtn = document.getElementById('taikhoan');
    const alias2 = document.createElement('a');
    alias2.id = 'btnTK';
    alias2.href = '#';
    alias2.style.display = 'none';
    document.body.appendChild(alias2);
    alias2.addEventListener('click', (e)=> { e.preventDefault(); accBtn.click(); });
  }
})();

/* Render functions that use SAN_PHAM */
function renderMainFromProduct(){
  elTitle.textContent = SAN_PHAM.ten || '—';
  document.getElementById('breadcrumbTitle').textContent = SAN_PHAM.ten || '';
  elMa.textContent = 'Mã: ' + (SAN_PHAM.ma || SAN_PHAM.id || '—');
  elMoTa.innerHTML = SAN_PHAM.moTa || '';
  renderGallery(SAN_PHAM);
  renderOptionButtons();
  renderMainSpecs();
  renderFullSpecs();
  renderLienQuan();
  capNhatGiaVaKho();
  updateSummary();
  capNhatBadgeGio();
}

/* Load product: thử API trước, fallback về DEMO_SAN_PHAM nếu lỗi */
async function loadProduct(productId){
  try{
    const res = await fetch('/api/products/' + encodeURIComponent(productId));
    if(!res.ok) throw new Error('API non-ok');
    const data = await res.json();
    if(!data || !data.id) throw new Error('Invalid product data');
    SAN_PHAM = data;
  } catch(err){
    console.warn('API load failed — using demo data. Error:', err);
    SAN_PHAM = typeof DEMO_SAN_PHAM !== 'undefined' ? DEMO_SAN_PHAM : null;
  }

  if(SAN_PHAM) renderMainFromProduct();
}

/* init */
(function init(){ const productId = 'SP-IPH17P-256'; loadProduct(productId); })();

/* Header demo behaviors (cart/account) */
const btnGioElem = document.getElementById('btnGio') || document.getElementById('cartBtn');
if(btnGioElem){ btnGioElem.addEventListener('click', (e)=>{ /* demo */ }); }
const btnTK = document.getElementById('btnTK') || document.getElementById('taikhoan');
if(btnTK){ btnTK.addEventListener('click', ()=>{ alert('Chức năng Tài khoản (demo)'); }); }
