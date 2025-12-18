/* Account menu behaviour + mobile search overlay toggle */
(function(){
  const btn = document.getElementById('nutTaiKhoan');
  const menu = document.getElementById('accountMenu');
  if(!btn || !menu) return;

  function openMenu(){ menu.setAttribute('aria-hidden','false'); btn.setAttribute('aria-expanded','true'); }
  function closeMenu(){ menu.setAttribute('aria-hidden','true'); btn.setAttribute('aria-expanded','false'); }

  btn.addEventListener('mouseenter', openMenu);
  btn.addEventListener('focus', openMenu);
  btn.addEventListener('click', (e)=> {
    const open = menu.getAttribute('aria-hidden') === 'false';
    (open ? closeMenu() : openMenu());
  });

  const wrapper = btn.closest('.account');
  if(wrapper){
    wrapper.addEventListener('mouseleave', function(){ setTimeout(closeMenu, 120); });
    wrapper.addEventListener('blur', function(){ setTimeout(closeMenu, 120); }, true);
  }

  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') closeMenu();
  });

  document.addEventListener('click', function(e){
    if(!e.target.closest('.account')) closeMenu();
  });

  menu.addEventListener('click', function(e){
    const item = e.target.closest('.account-item');
    if(!item) return;
    const action = item.dataset.action;
    if(action === 'logout'){
      try { localStorage.removeItem('user'); } catch(err){}
      closeMenu();
      showToast('Bạn đã đăng xuất');
    } else if(action === 'profile'){
      closeMenu();
      showToast('Mở trang thay đổi thông tin (nếu có).');
    }
  });

  menu.addEventListener('keydown', function(e){
    if(e.key === 'Enter' || e.key === ' '){
      const item = document.activeElement;
      if(item && item.classList.contains('account-item')) item.click();
    }
  });
})();

/* Mobile search overlay */
(function(){
  let overlay = null;
  function createOverlay(){
    overlay = document.createElement('div');
    overlay.className = 'search-overlay';
    overlay.style.display = 'none';
    overlay.innerHTML = `<div class="search-inner"><input id="mobileSearchInput" placeholder="Tìm sản phẩm, đơn, khách..." aria-label="Tìm kiếm"/><button id="mobileSearchClose" class="nut-gio">Đóng</button></div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#mobileSearchClose').addEventListener('click', ()=> { overlay.style.display='none'; overlay.setAttribute('aria-hidden','true'); });
    overlay.addEventListener('click', function(e){ if(e.target === overlay){ overlay.style.display='none'; overlay.setAttribute('aria-hidden','true'); } });
  }
  const btnSearch = document.getElementById('nutTimKiem');
  if(!btnSearch) return;
  btnSearch.addEventListener('click', function(e){
    if(window.innerWidth <= 900){
      if(!overlay) createOverlay();
      overlay.style.display='flex';
      overlay.setAttribute('aria-hidden','false');
      setTimeout(()=> {
        const input = overlay.querySelector('input');
        if(input) input.focus();
      }, 60);
    } else {
      const el = document.getElementById('timKiemChung');
      if(el) el.focus();
    }
  });
})();
