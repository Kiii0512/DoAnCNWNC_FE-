const STORAGE_KEY = 'admin_discounts_local';

async function loadRemoteDiscounts(){
  try{
    const r = await fetch('discounts.json');
    return await r.json();
  }catch(e){ return [] }
}

function loadLocal(){
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {overrides:{}, deleted:[]};
}
function saveLocal(obj){ localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); }

async function getMergedDiscounts(){
  const remote = await loadRemoteDiscounts();
  const local = loadLocal();
  const merged = remote.filter(d=>!local.deleted.includes(d.id)).map(d=> local.overrides[d.id] ? {...d, ...local.overrides[d.id]} : d);
  // also include local-only created
  for(const id in local.overrides){ if(!merged.find(x=>x.id===id) && !local.deleted.includes(id)) merged.push(local.overrides[id]); }
  return merged;
}

async function renderList(){
  const t = document.getElementById('discountTbody');
  if(!t) return;
  const list = await getMergedDiscounts();
  t.innerHTML = list.map(d=>{
    const time = (d.startDate||'') + ' → ' + (d.endDate||'');
    const assigned = `P:${(d.products||[]).length} C:${(d.categories||[]).length}`;
    const status = d.active? 'Active' : 'Inactive';
    return `<tr>
      <td>${d.code}</td>
      <td>${d.description||''}</td>
      <td>${d.type}</td>
      <td>${d.type==='percent'? d.value + '%': (d.value? d.value+'₫':'-')}</td>
      <td>${time}</td>
      <td>${d.used||0}/${d.usageLimit||'∞'}</td>
      <td>${assigned}</td>
      <td>${status}</td>
      <td>
        <a href="edit.html?id=${encodeURIComponent(d.id)}">Sửa</a>
        <button data-id="${d.id}" class="btn del">Xóa</button>
      </td>
    </tr>`;
  }).join('');

  // attach delete handlers
  t.querySelectorAll('.btn.del').forEach(btn=> btn.addEventListener('click', (e)=>{
    const id = btn.getAttribute('data-id');
    if(!confirm('Xác nhận xóa coupon: '+id)) return;
    const local = loadLocal();
    local.deleted.push(id);
    saveLocal(local);
    renderList();
  }));
}

// Edit page helpers
async function loadDiscountForEdit(){
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if(!id) return null;
  const discounts = await getMergedDiscounts();
  return discounts.find(x=>x.id===id) || null;
}

function formToObj(){
  return {
    id: document.getElementById('fldCode').value.trim() || 'id-'+Date.now(),
    code: document.getElementById('fldCode').value.trim(),
    description: document.getElementById('fldDesc').value.trim(),
    type: document.getElementById('fldType').value,
    value: Number(document.getElementById('fldValue').value)||0,
    startDate: document.getElementById('fldStart').value || null,
    endDate: document.getElementById('fldEnd').value || null,
    usageLimit: Number(document.getElementById('fldLimit').value)||0,
    products: (document.getElementById('fldProducts').value||'').split(',').map(s=>s.trim()).filter(Boolean).map(v=>isNaN(v)?v:Number(v)),
    categories: (document.getElementById('fldCategories').value||'').split(',').map(s=>s.trim()).filter(Boolean),
    active: document.getElementById('fldActive').checked
  };
}

function populateForm(d){
  document.getElementById('fldCode').value = d.code || '';
  document.getElementById('fldDesc').value = d.description||'';
  document.getElementById('fldType').value = d.type || 'percent';
  document.getElementById('fldValue').value = d.value || 0;
  document.getElementById('fldStart').value = d.startDate || '';
  document.getElementById('fldEnd').value = d.endDate || '';
  document.getElementById('fldLimit').value = d.usageLimit||0;
  document.getElementById('fldProducts').value = (d.products||[]).join(',');
  document.getElementById('fldCategories').value = (d.categories||[]).join(',');
  document.getElementById('fldActive').checked = Boolean(d.active);
}

function saveDiscount(obj){
  const local = loadLocal();
  local.overrides[obj.id]=obj;
  // ensure removed from deleted
  local.deleted = (local.deleted||[]).filter(x=>x!==obj.id);
  saveLocal(local);
}

// init
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded', async ()=>{
    if(document.getElementById('discountTbody')) await renderList();

    // edit page init
    if(document.getElementById('discountForm')){
      const d = await loadDiscountForEdit();
      if(d) populateForm(d);

      document.getElementById('btnCancel').addEventListener('click', ()=> location.href='index.html');

      document.getElementById('discountForm').addEventListener('submit', (e)=>{
        e.preventDefault();
        // basic validation
        const code = document.getElementById('fldCode').value.trim();
        if(!code){ alert('Mã coupon là bắt buộc'); return; }
        const obj = formToObj();
        saveDiscount(obj);
        alert('Lưu thành công');
        location.href='index.html';
      });
    }
  });
} else {
  if(document.getElementById('discountTbody')) renderList();
}
