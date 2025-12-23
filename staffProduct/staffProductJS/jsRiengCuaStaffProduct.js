/* Page logic (data + UI handlers) — extracted from original inline script */
const KHOA_SP = 'admin_sanpham_demo_v2';
const MAU_SP = [
  { id:'SP-001', sku:'SP-001', ten:'iPhone 17 Pro', gia:32990000, ton:12, img:'https://via.placeholder.com/300x200?text=iPhone+17+Pro', extras:[], specs:[], colors:[], caps:[] },
  { id:'SP-002', sku:'SP-002', ten:'AirPods Pro 2', gia:4990000, ton:5, img:'https://via.placeholder.com/300x200?text=AirPods+Pro+2', extras:[], specs:[], colors:[], caps:[] },
  { id:'SP-003', sku:'SP-003', ten:'Cáp Type-C', gia:190000, ton:30, img:'https://via.placeholder.com/300x200?text=Cap+Type-C', extras:[], specs:[], colors:[], caps:[] }
];

function taiSp(){ try{ return JSON.parse(localStorage.getItem(KHOA_SP)) || MAU_SP.slice(); }catch(e){ return MAU_SP.slice(); } }
function luuSp(arr){ localStorage.setItem(KHOA_SP, JSON.stringify(arr)); }
function generateId(){ const arr = taiSp(); let max=0; arr.forEach(p=>{ const m = String(p.id||'').match(/^(?:SP-|)(\d+)$/); if(m){ const n=Number(m[1]); if(n>max) max=n; } }); return 'SP-' + String(max+1).padStart(3,'0'); }
function generateSku(){ const arr = taiSp(); const existing = new Set(arr.map(x=> (x.sku||'').toUpperCase())); let n=1; while(true){ const s = 'SP-' + String(n).padStart(3,'00'); if(!existing.has(s)) return s; n++; } }
function dinhVND(n){ return Number(n||0).toLocaleString('vi-VN') + '₫' }
function showToast(msg, ms=1400){ const t=document.getElementById('toast'); if(!t) return; t.textContent=msg; t.classList.add('show'); clearTimeout(t._t); t._t=setTimeout(()=> t.classList.remove('show'), ms); }

/* Render table */
function renderBangSanPham(){
  const tbody = document.querySelector('#bangSanPham tbody'); tbody.innerHTML='';
  const q = (document.getElementById('qSp').value||'').toLowerCase();
  const loc = document.querySelector('.seg-btn.active')?.dataset.value || '';
  let arr = taiSp();
  if(loc){ if(loc==='con') arr = arr.filter(p=> (p.ton||0) > 0); else arr = arr.filter(p=> (p.ton||0) <= 0); }
  if(q) arr = arr.filter(p => (p.ten||'').toLowerCase().includes(q) || (p.sku||'').toLowerCase().includes(q) || (p.id||'').toLowerCase().includes(q));

  arr.forEach(p=>{
    const tr = document.createElement('tr');
    const thumb = escapeHtml(p.img || (p.extras && p.extras[0]) || 'https://via.placeholder.com/300x200?text=No+Image');
    tr.innerHTML = `
      <td><input type="checkbox" class="chkSP" data-id="${p.id}" /></td>
      <td><img class="thumb" src="${thumb}" alt="${escapeHtml(p.ten||'')}" /></td>
      <td><strong>${escapeHtml(p.sku||p.id)}</strong><div class="small muted">${escapeHtml(p.ten||'')}</div></td>
      <td>${dinhVND(p.gia)}</td>
      <td>${p.ton}</td>
      <td class="small">
        <button class="btn btn-ghost xemChiTiet" data-id="${p.id}">Chi tiết</button>
        <button class="btn btn-ghost sua" data-id="${p.id}">Sửa</button>
        <button class="btn btn-ghost" data-action="xoa" data-id="${p.id}">Xóa</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById('totalCount').textContent = (arr.length||0);

  document.querySelectorAll('.sua').forEach(b=> b.addEventListener('click', e=> moDrawerSua(e.target.dataset.id)));
  document.querySelectorAll('button[data-action="xoa"]').forEach(b=> b.addEventListener('click', e=> {
    const id = e.target.dataset.id; if(!confirm('Bạn có chắc muốn xóa ' + id + ' ?')) return; xoaSanPham(id);
  }));

  document.querySelectorAll('.xemChiTiet').forEach(b=> b.addEventListener('click', function(e){
    const id = this.dataset.id || (e.currentTarget && e.currentTarget.dataset.id);
    openDetailModal(id);
  }));
}

/* Drawer state + images */
const drawer = document.getElementById('drawerSP');
const backdrop = document.getElementById('backdrop');
const drawerTitle = document.getElementById('drawerTitle');

const spSku = document.getElementById('spSku');
const spTen = document.getElementById('spTen');
const spGia = document.getElementById('spGia');
const spTon = document.getElementById('spTon');
const spMoTa = document.getElementById('spMoTa');

const specsBox = document.getElementById('specsBox');
const btnAddSpec = document.getElementById('btnAddSpec');

const colorInput = document.getElementById('colorInput');
const btnAddColor = document.getElementById('btnAddColor');
const colorsList = document.getElementById('colorsList');

const capInput = document.getElementById('capInput');
const btnAddCap = document.getElementById('btnAddCap');
const capsList = document.getElementById('capsList');

const spImgMain = document.getElementById('spImgMain');
const spFiles = document.getElementById('spFiles');
const spMainPreview = document.getElementById('spMainPreview');
const spThumbs = document.getElementById('spThumbs');
const fileNames = document.getElementById('fileNames');
const dropArea = document.getElementById('dropArea');

const btnChooseFiles = document.getElementById('btnChooseFiles');
const btnClearImages = document.getElementById('btnClearImages');

const errSku = document.getElementById('errSku');
const errTen = document.getElementById('errTen');
const errGia = document.getElementById('errGia');
const errTon = document.getElementById('errTon');

const btnLuu = document.getElementById('btnLuuSP');

let editingId = null;
let imagesState = { main: null, thumbs: [] };
let specsState = [];
let colorsState = [];
let capsState = [];
let filesReading = 0;

function setSavingEnabled(enabled){ btnLuu.disabled = !enabled; btnLuu.style.opacity = enabled ? '' : '0.55'; btnLuu.style.pointerEvents = enabled ? '' : 'none'; }

function openBackdrop(){ backdrop.hidden = false; backdrop.classList.add('show'); }
function closeBackdrop(){ backdrop.classList.remove('show'); backdrop.hidden = true; }
function resetErrors(){ [errSku,errTen,errGia,errTon].forEach(e=> { if(e){ e.style.display='none'; e.textContent=''; } }); }

function clampImgs(){ if(imagesState.main && imagesState.thumbs.length > 3) imagesState.thumbs = imagesState.thumbs.slice(0,3); if(!imagesState.main && imagesState.thumbs.length > 4) imagesState.thumbs = imagesState.thumbs.slice(0,4); }

function updateImageUI(){
  const main = imagesState.main || (imagesState.thumbs[0] || null);
  if(spMainPreview) spMainPreview.innerHTML = main ? `<img src="${escapeHtml(main)}" alt="main" />` : '<span class="small muted">Xem trước ảnh chính</span>';

  if(spThumbs){
    spThumbs.innerHTML = '';
    const thumbsToShow = imagesState.thumbs.slice(0,3);
    thumbsToShow.forEach((url, idx)=>{
      const div = document.createElement('div'); div.className='thumb-action';
      div.draggable = true; div.dataset.idx = idx;
      div.innerHTML = `<img src="${escapeHtml(url)}" alt="thumb" />
        <div class="thumb-controls">
          <button class="small btn" data-act="setmain" data-idx="${idx}" title="Đặt làm ảnh chính">M</button>
          <button class="small btn" data-act="remove" data-idx="${idx}" title="Xóa">✖</button>
        </div>`;
      spThumbs.appendChild(div);
    });

    for(let i=thumbsToShow.length;i<3;i++){ const div = document.createElement('div'); div.className='thumb-action'; div.style.opacity='0.6'; div.innerHTML = '<span class="small muted">Ảnh phụ</span>'; spThumbs.appendChild(div); }
  }

  if(spImgMain) spImgMain.value = imagesState.main || '';
  if(fileNames) fileNames.textContent = '';
}

function thumbsDelegationHandler(e){
  const btn = e.target.closest('button[data-act]');
  if(btn){
    const act = btn.dataset.act;
    const idx = Number(btn.dataset.idx);
    if(act === 'setmain'){
      const url = imagesState.thumbs[idx]; if(!url) return;
      const prevMain = imagesState.main;
      imagesState.main = url;
      imagesState.thumbs.splice(idx,1);
      if(prevMain) imagesState.thumbs.unshift(prevMain);
      clampImgs(); updateImageUI();
    } else if(act === 'remove'){
      imagesState.thumbs.splice(idx,1); clampImgs(); updateImageUI();
    }
  }
}
if(spThumbs) spThumbs.addEventListener('click', thumbsDelegationHandler);

let dragSrcIndex = null;
if(spThumbs){
  spThumbs.addEventListener('dragstart', function(e){
    const el = e.target.closest('.thumb-action');
    if(!el) return;
    dragSrcIndex = Number(el.dataset.idx);
    e.dataTransfer.effectAllowed = 'move';
  });
  spThumbs.addEventListener('dragover', function(e){
    e.preventDefault();
    const el = e.target.closest('.thumb-action');
    if(el) { el.style.opacity = '0.7'; }
  });
  spThumbs.addEventListener('dragleave', function(e){
    const el = e.target.closest('.thumb-action');
    if(el) { el.style.opacity = ''; }
  });
  spThumbs.addEventListener('drop', function(e){
    e.preventDefault();
    const el = e.target.closest('.thumb-action');
    if(!el) return;
    const dstIndex = Number(el.dataset.idx);
    if(dragSrcIndex == null || isNaN(dstIndex)) return;
    const thumbs = imagesState.thumbs;
    if(dragSrcIndex < 0 || dragSrcIndex >= thumbs.length || dstIndex<0 || dstIndex>=thumbs.length) { dragSrcIndex=null; return; }
    const item = thumbs.splice(dragSrcIndex,1)[0];
    thumbs.splice(dstIndex,0,item);
    clampImgs(); updateImageUI();
    dragSrcIndex = null;
  });
}

/* open/close drawer */
document.getElementById('btnTaoMoi').addEventListener('click', moDrawerTao);
document.getElementById('btnDongDrawer').addEventListener('click', ()=> closeDrawer());
document.getElementById('btnHuy').addEventListener('click', ()=> closeDrawer());

function moDrawerTao(){
  editingId = null; drawerTitle.textContent = 'Tạo sản phẩm mới';
  spSku.value=''; spTen.value=''; spGia.value=''; spTon.value='1'; spMoTa.value='';
  specsState = []; colorsState = []; capsState = [];
  renderSpecsUI(); renderColorsUI(); renderCapsUI();
  spImgMain.value=''; spFiles.value=''; imagesState = { main:null, thumbs:[] }; updateImageUI(); resetErrors();
  drawer.classList.add('open'); drawer.setAttribute('aria-hidden','false'); openBackdrop(); setSavingEnabled(true);
}

function moDrawerSua(id){
  const arr = taiSp(); const p = arr.find(x=> x.id===id);
  if(!p) return;
  editingId = id;
  drawerTitle.textContent = 'Sửa sản phẩm — ' + (p.sku||p.id);
  spSku.value = p.sku||''; spTen.value = p.ten||''; spGia.value = p.gia||0; spTon.value = p.ton||0; spMoTa.value = p.moTa||'';
  specsState = Array.isArray(p.specs) ? p.specs.map(s=>({k:s.k,v:s.v})) : [];
  colorsState = Array.isArray(p.colors) ? p.colors.slice() : [];
  capsState = Array.isArray(p.caps) ? p.caps.slice() : [];
  renderSpecsUI(); renderColorsUI(); renderCapsUI();

  const main = p.img || null; const extras = Array.isArray(p.extras) ? p.extras.slice(0,3) : [];
  imagesState = { main: main, thumbs: extras.slice() };
  spFiles.value=''; updateImageUI(); resetErrors(); drawer.classList.add('open'); drawer.setAttribute('aria-hidden','false'); openBackdrop(); setSavingEnabled(true);
}

function closeDrawer(){ drawer.classList.remove('open'); drawer.setAttribute('aria-hidden','true'); closeBackdrop(); setSavingEnabled(true); }

backdrop.addEventListener('click', ()=>{ closeDrawer(); });
document.querySelector('.drawer-body').addEventListener('click', (e)=> e.stopPropagation());

// sync main URL input
spImgMain.addEventListener('input', ()=>{
  const v = (spImgMain.value||'').trim(); imagesState.main = v || null;
  imagesState.thumbs = imagesState.thumbs.filter(u => u !== imagesState.main);
  clampImgs(); updateImageUI();
});

// files input
spFiles.addEventListener('change', (e)=>{
  const files = Array.from(e.target.files || []);
  if(!files.length) return;
  fileNames.textContent = files.map(f=>f.name).join(', ');

  setSavingEnabled(false);
  filesReading += files.length;

  (async ()=>{
    for(const f of files){
      if(!f.type.startsWith('image/')) { filesReading--; continue; }
      try{
        const data = await readFileAsDataURL(f);
        if(!imagesState.main){
          imagesState.main = data;
        } else if(imagesState.thumbs.length < 3){
          imagesState.thumbs.push(data);
        } else {
          // ignore extras beyond limit
        }
      } catch(err){
        console.warn('read file fail', err);
      } finally {
        filesReading--;
      }
    }
    const waiter = setInterval(()=>{
      if(filesReading <= 0){
        clearInterval(waiter);
        clampImgs();
        updateImageUI();
        setSavingEnabled(true);
        spFiles.value = '';
        fileNames.textContent = '';
      }
    }, 60);
  })();
});

function readFileAsDataURL(file){ return new Promise((res, rej)=>{ const r=new FileReader(); r.onload = ()=> res(r.result); r.onerror = ()=> rej(r.error); r.readAsDataURL(file); }); }

// drag & drop upload on dropArea
;(function dragDropSetup(){
  if(!dropArea) return;
  ['dragenter','dragover'].forEach(ev => {
    dropArea.addEventListener(ev, function(e){
      e.preventDefault();
      dropArea.classList.add('drop-active');
    });
  });
  ['dragleave','drop','dragend'].forEach(ev => {
    dropArea.addEventListener(ev, function(e){
      e.preventDefault();
      dropArea.classList.remove('drop-active');
    });
  });

  dropArea.addEventListener('drop', function(e){
    e.preventDefault();
    const dt = e.dataTransfer;
    const files = Array.from(dt.files || []).filter(f=> f.type && f.type.startsWith('image/'));
    if(!files.length) return;
    setSavingEnabled(false);
    filesReading += files.length;
    (async ()=>{
      for(const f of files){
        try{
          const data = await readFileAsDataURL(f);
          if(!imagesState.main){
            imagesState.main = data;
          } else if(imagesState.thumbs.length < 3){
            imagesState.thumbs.push(data);
          } else {
            // ignore
          }
        } catch(err){
          console.warn('read file fail', err);
        } finally {
          filesReading--;
        }
      }
      const waiter = setInterval(()=>{
        if(filesReading <= 0){
          clearInterval(waiter);
          clampImgs();
          updateImageUI();
          setSavingEnabled(true);
        }
      }, 60);
    })();
  });
})();

document.getElementById('btnClearImages').addEventListener('click', ()=>{ imagesState = { main:null, thumbs:[] }; updateImageUI(); showToast('Đã xóa ảnh tạm'); });

/* Specs UI */
function renderSpecsUI(){
  specsBox.innerHTML = '';
  specsState.forEach((s,i)=>{
    const row = document.createElement('div'); row.className='spec-row';
    const k = document.createElement('input'); k.placeholder='Đề mục (ví dụ: Kích thước)'; k.value = s.k || '';
    const v = document.createElement('input'); v.placeholder='Nội dung (ví dụ: 6.7 inch)'; v.value = s.v || '';
    const btn = document.createElement('button'); btn.className='btn btn-ghost'; btn.textContent='Xóa';
    btn.addEventListener('click', ()=> { specsState.splice(i,1); renderSpecsUI(); });
    k.addEventListener('input', ()=> { specsState[i].k = k.value; });
    v.addEventListener('input', ()=> { specsState[i].v = v.value; });
    row.appendChild(k); row.appendChild(v); row.appendChild(btn);
    specsBox.appendChild(row);
  });
  if(specsState.length === 0){
    const hint = document.createElement('div'); hint.className='small muted'; hint.style.padding='8px 4px'; hint.textContent = 'Chưa có thông số nào. Nhấn "Thêm đề mục" để thêm.'; specsBox.appendChild(hint);
  }
}
document.getElementById('btnAddSpec').addEventListener('click', ()=>{ specsState.push({k:'', v:''}); renderSpecsUI(); });

/* Colors / caps */
function renderColorsUI(){
  colorsList.innerHTML = '';
  colorsState.forEach((c, i)=>{
    const chip = document.createElement('div'); chip.className='chip';
    chip.innerHTML = `${escapeHtml(c)} <button aria-label="Xóa màu" data-i="${i}">✖</button>`;
    chip.querySelector('button').addEventListener('click', ()=> { colorsState.splice(i,1); renderColorsUI(); });
    colorsList.appendChild(chip);
  });
}
function renderCapsUI(){
  capsList.innerHTML = '';
  capsState.forEach((c, i)=>{
    const chip = document.createElement('div'); chip.className='chip';
    chip.innerHTML = `${escapeHtml(c)} <button aria-label="Xóa dung lượng" data-i="${i}">✖</button>`;
    chip.querySelector('button').addEventListener('click', ()=> { capsState.splice(i,1); renderCapsUI(); });
    capsList.appendChild(chip);
  });
}
document.getElementById('btnAddColor').addEventListener('click', ()=> {
  const v = (colorInput.value||'').trim(); if(!v) return; if(!colorsState.includes(v)) colorsState.push(v); colorInput.value=''; renderColorsUI();
});
colorInput.addEventListener('keydown', (e)=> { if(e.key === 'Enter'){ e.preventDefault(); document.getElementById('btnAddColor').click(); } });

document.getElementById('btnAddCap').addEventListener('click', ()=> {
  const v = (capInput.value||'').trim(); if(!v) return; if(!capsState.includes(v)) capsState.push(v); capInput.value=''; renderCapsUI();
});
capInput.addEventListener('keydown', (e)=> { if(e.key === 'Enter'){ e.preventDefault(); document.getElementById('btnAddCap').click(); } });

/* Save product */
function validateForm(){ resetErrors(); let ok=true; const ten = (spTen.value||'').trim(); const giaRaw = spGia.value; const gia = Number(giaRaw);
  if(ten.length === 0){ errTen.style.display='block'; errTen.textContent='Tên sản phẩm là bắt buộc'; ok=false; }
  if(giaRaw === '' || isNaN(gia)) { errGia.style.display='block'; errGia.textContent='Giá là bắt buộc và phải là số'; ok=false; }
  else if(gia < 0){ errGia.style.display='block'; errGia.textContent='Giá phải >= 0'; ok=false; }
  if(!Number.isInteger(Number(spTon.value)) || Number(spTon.value) < 0){ errTon.style.display='block'; errTon.textContent='Tồn kho phải là số nguyên >= 0'; ok=false; }
  return ok;
}

btnLuu.addEventListener('click', ()=>{
  if(btnLuu.disabled) return;
  if(!validateForm()) return;
  const skuInput = (spSku.value||'').trim(); const skuUpper = skuInput.toUpperCase(); const ten = (spTen.value||'').trim(); const gia = Number(spGia.value)||0; const ton = Number(spTon.value)||0; const moTa = (spMoTa.value||'').trim();
  const arr = taiSp();

  if(skuInput){ const dup = arr.find(x=> (x.sku||'').toUpperCase() === skuUpper && x.id !== editingId); if(dup){ errSku.style.display='block'; errSku.textContent = 'SKU đã tồn tại: ' + dup.sku; return; } }
  const finalSku = skuInput ? skuInput : generateSku();

  if(!imagesState.main && imagesState.thumbs.length) imagesState.main = imagesState.thumbs.shift();
  const mainImg = imagesState.main || '';
  const extras = imagesState.thumbs.slice(0,3);

  const rows = specsBox.querySelectorAll('.spec-row');
  specsState = Array.from(rows).map(r => {
    const k = r.querySelector('input:nth-child(1)')?.value || '';
    const v = r.querySelector('input:nth-child(2)')?.value || '';
    return {k:k, v:v};
  }).filter(s => (s.k||'').trim() || (s.v||'').trim());

  if(editingId){
    const i = arr.findIndex(x=> x.id===editingId); if(i===-1) return;
    arr[i].sku = finalSku; arr[i].ten = ten; arr[i].gia = gia; arr[i].ton = ton;
    arr[i].moTa = moTa; arr[i].img = mainImg; arr[i].extras = extras;
    arr[i].specs = specsState; arr[i].colors = colorsState.slice(); arr[i].caps = capsState.slice();
    luuSp(arr); showToast('Đã cập nhật');
  } else {
    const id = generateId();
    arr.unshift({ id, sku: finalSku, ten, gia, ton, moTa, img: mainImg, extras, specs:specsState, colors: colorsState.slice(), caps: capsState.slice() });
    luuSp(arr); showToast('Tạo sản phẩm thành công');
  }
  renderBangSanPham(); closeDrawer();
});

function xoaSanPham(id){ let arr = taiSp(); arr = arr.filter(p=> p.id !== id); luuSp(arr); renderBangSanPham(); showToast('Đã xóa ' + id); }

/* Detail modal */
const detailModal = document.getElementById('detailModal');
const btnCloseDetail = document.getElementById('btnCloseDetail');
const btnCloseFromDetail = document.getElementById('btnCloseFromDetail');
const btnEditFromDetail = document.getElementById('btnEditFromDetail');
const detailImg = document.getElementById('detailImg');
const detailSku = document.getElementById('detailSku');
const detailName = document.getElementById('detailName');
const detailPrice = document.getElementById('detailPrice');
const detailStock = document.getElementById('detailStock');
const detailDesc = document.getElementById('detailDesc');
const detailThumbs = document.getElementById('detailThumbs');
const detailSpecs = document.getElementById('detailSpecs');
const detailVariants = document.getElementById('detailVariants');

function openDetailModal(id){
  const arr = taiSp();
  const p = arr.find(x => x.id === id);
  if(!p) return;
  detailName.textContent = p.ten || '';
  detailSku.textContent = p.sku || p.id || '';
  detailPrice.textContent = dinhVND(p.gia);
  detailStock.textContent = (p.ton != null ? p.ton : '-');
  detailDesc.textContent = p.moTa || '';
  detailSpecs.innerHTML = '';
  if(Array.isArray(p.specs) && p.specs.length){
    p.specs.forEach(s=> {
      const d = document.createElement('div'); d.className='small muted'; d.textContent = `${s.k}: ${s.v}`; detailSpecs.appendChild(d);
    });
  } else {
    detailSpecs.textContent = '-';
  }
  detailVariants.innerHTML = '';
  const parts = [];
  if(Array.isArray(p.colors) && p.colors.length) parts.push('Màu: ' + p.colors.join(', '));
  if(Array.isArray(p.caps) && p.caps.length) parts.push('Dung lượng: ' + p.caps.join(', '));
  detailVariants.textContent = parts.length ? parts.join(' • ') : '-';

  const main = p.img || 'https://via.placeholder.com/600x400?text=No+Image';
  detailImg.innerHTML = `<img src="${escapeHtml(main)}" alt="${escapeHtml(p.ten||'')}" />`;
  detailThumbs.innerHTML = '';
  (Array.isArray(p.extras)?p.extras:[]).forEach(u=>{
    const im = document.createElement('img'); im.src = u; im.title='Ảnh phụ';
    im.addEventListener('click', ()=> { detailImg.innerHTML = `<img src="${escapeHtml(u)}" alt="" />`; });
    detailThumbs.appendChild(im);
  });

  detailModal._currentId = id;
  detailModal.classList.add('open'); detailModal.setAttribute('aria-hidden','false'); document.body.style.overflow = 'hidden';
}
function closeDetailModal(){ detailModal.classList.remove('open'); detailModal.setAttribute('aria-hidden','true'); document.body.style.overflow = ''; detailModal._currentId = null; }
btnCloseDetail.addEventListener('click', closeDetailModal); btnCloseFromDetail.addEventListener('click', closeDetailModal);
detailModal.addEventListener('click', (e)=> { if(e.target === detailModal) closeDetailModal(); });
btnEditFromDetail.addEventListener('click', ()=>{ const id = detailModal._currentId; if(!id) return; closeDetailModal(); moDrawerSua(id); });

/* helpers + init */
document.getElementById('chkAllSP').addEventListener('change', function(){ document.querySelectorAll('.chkSP').forEach(c=> c.checked = this.checked); });
document.getElementById('btnLamMoiSP').addEventListener('click', ()=>{ renderBangSanPham(); showToast('Đã làm mới'); });

const clearQSp = document.getElementById('clearQSp');
const qInput = document.getElementById('qSp');
function toggleClearQ(){ clearQSp.style.display = (qInput.value && qInput.value.trim()) ? 'inline-flex' : 'none'; }
qInput.addEventListener('input', ()=>{ toggleClearQ(); debounce(renderBangSanPham,220)(); });
clearQSp.addEventListener('click', ()=>{ qInput.value=''; toggleClearQ(); renderBangSanPham(); });
document.querySelectorAll('.seg-btn').forEach(b=> b.addEventListener('click', (e)=>{ document.querySelectorAll('.seg-btn').forEach(x=> x.classList.remove('active')); e.target.classList.add('active'); renderBangSanPham(); }));

const clearBtn = document.getElementById('clearSearch'); const mainSearch = document.getElementById('timKiemChung');
function toggleClear(){ const v = mainSearch.value && mainSearch.value.trim(); if(clearBtn) clearBtn.style.display = v ? 'inline-flex' : 'none'; }
if(mainSearch){
  mainSearch.addEventListener('input', ()=>{ toggleClear(); const qEl = document.getElementById('qSp'); if(qEl) qEl.value = mainSearch.value; toggleClearQ(); debounce(renderBangSanPham,220)(); });
}
if(clearBtn) clearBtn.addEventListener('click', ()=>{ if(mainSearch) mainSearch.value=''; const qEl = document.getElementById('qSp'); if(qEl) qEl.value=''; toggleClear(); toggleClearQ(); renderBangSanPham(); });

(function init(){ if(!localStorage.getItem(KHOA_SP)) luuSp(MAU_SP); renderBangSanPham(); toggleClear(); toggleClearQ(); setSavingEnabled(true); })();

function escapeHtml(s){ if(!s && s!==0) return ''; return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function debounce(fn, ms){ let t; return function(){ clearTimeout(t); const args=arguments; t=setTimeout(()=>fn.apply(this,args), ms); } }
