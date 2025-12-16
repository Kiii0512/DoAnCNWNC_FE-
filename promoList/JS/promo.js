async function fetchPromos(){const resp=await fetch('promos.json');return resp.json();}
function formatDate(d){const dt=new Date(d);return dt.toLocaleDateString();}
async function renderPromoList(){const container=document.getElementById('promoContainer');if(!container) return;const promos=await fetchPromos();container.innerHTML=promos.map(p=>`
  <article class="promo-card">
    <h3>${p.title}</h3>
    <p>${p.shortDesc}</p>
    <div class="meta">${formatDate(p.startDate)} → ${formatDate(p.endDate)}</div>
    <a href="promoDetail.html?id=${encodeURIComponent(p.id)}" class="promo-link">Xem chi tiết</a>
  </article>`).join('');}
async function renderPromoDetail(){const container=document.getElementById('promoDetailContainer');if(!container) return;const params=new URLSearchParams(window.location.search);const id=params.get('id');const promos=await fetchPromos();const p=promos.find(x=>x.id===id);if(!p){container.innerHTML='<p>Không tìm thấy chương trình khuyến mãi.</p>';return;}container.innerHTML=`
  <div class="promo-detail-card">
    <div class="title">${p.title}</div>
    <div class="meta">${formatDate(p.startDate)} → ${formatDate(p.endDate)}</div>
    <div class="content">${p.content}</div>
    <a class="promo-cta" href="${p.cta?.link||'#'}">${p.cta?.text||'Tìm hiểu'}</a>
  </div>`}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',()=>{if(document.getElementById('promoContainer')) renderPromoList();if(document.getElementById('promoDetailContainer')) renderPromoDetail();});}else{if(document.getElementById('promoContainer')) renderPromoList();if(document.getElementById('promoDetailContainer')) renderPromoDetail();}