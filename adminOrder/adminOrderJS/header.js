/* Header behaviors: nút tìm, account menu */
(function(){
  /* Focus tìm kiếm khi bấm nút */
  const nutTim = document.getElementById('nutTimKiem');
  if(nutTim){
    nutTim.addEventListener('click', function(e){
      e.preventDefault();
      const input = document.getElementById('timKiemChung');
      if(input) input.focus();
    });
  }

  /* Account menu behaviour */
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
})();
