/* menu.js
   Logic cho menu ngang cuộn (chung cho adminOrder và adminExport)
   - Gồm: xử lý nút trái/phải, kéo touch, keyboard, persistence via location.hash
   - Chú thích bằng tiếng Việt
*/
'use strict';

(function () {
  // Thử lấy các phần tử cần thiết; nếu không tìm thấy thì dừng (caller nên nạp menuAdmin.html trước khi nạp file này)
  const wrap = document.getElementById('scrollWrap');
  const inner = document.getElementById('scrollInner');
  const left = document.getElementById('leftArrow');
  const right = document.getElementById('rightArrow');

  if (!wrap || !inner) {
    // Không có menu trên trang hiện tại -> nothing to do
    console.warn('menu.js: #scrollWrap hoặc #scrollInner không tìm thấy. Hãy đảm bảo partial menu được inject trước khi load menu.js');
    return;
  }

  // ------ Helpers: cập nhật trạng thái mũi tên trái/phải ------
  function updateArrows() {
    const maxScroll = Math.max(0, inner.scrollWidth - wrap.clientWidth);
    // nếu không overflow -> ẩn cả hai
    if (maxScroll <= 2) {
      if (left) { left.hidden = true; left.setAttribute('aria-hidden', 'true'); }
      if (right) { right.hidden = true; right.setAttribute('aria-hidden', 'true'); }
      wrap.classList.remove('hasOverflow');
      return;
    }
    wrap.classList.add('hasOverflow');

    if (wrap.scrollLeft <= 4) {
      if (left) { left.hidden = true; left.setAttribute('aria-hidden', 'true'); }
    } else {
      if (left) { left.hidden = false; left.removeAttribute('aria-hidden'); }
    }

    if (wrap.scrollLeft >= maxScroll - 4) {
      if (right) { right.hidden = true; right.setAttribute('aria-hidden', 'true'); }
    } else {
      if (right) { right.hidden = false; right.removeAttribute('aria-hidden'); }
    }
  }

  // ------ Smooth scroll helper ------
  function smoothScrollTo(elem, to, duration = 300) {
    const start = elem.scrollLeft;
    const change = to - start;
    const startTime = performance.now();
    function animate(time) {
      const t = Math.min(1, (time - startTime) / duration);
      // ease in-out quad-ish
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      elem.scrollLeft = Math.round(start + change * eased);
      if (t < 1) requestAnimationFrame(animate);
      else updateArrows();
    }
    requestAnimationFrame(animate);
  }

  function doScroll(direction) {
    const step = Math.round(wrap.clientWidth * 0.7) || 200;
    const maxScroll = Math.max(0, inner.scrollWidth - wrap.clientWidth);
    const target = direction === 'right'
      ? Math.min(maxScroll, wrap.scrollLeft + step)
      : Math.max(0, wrap.scrollLeft - step);
    smoothScrollTo(wrap, target, 300);
  }

  // ------ Gắn sự kiện cho nút mũi tên ------
  if (right) right.addEventListener('click', (e) => { e.stopPropagation(); doScroll('right'); });
  if (left) left.addEventListener('click', (e) => { e.stopPropagation(); doScroll('left'); });

  // keyboard activation cho nút (Enter / Space)
  if (right) right.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); right.click(); } });
  if (left) left.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); left.click(); } });

  // update khi resize / scroll
  window.addEventListener('resize', updateArrows);
  wrap.addEventListener('scroll', () => { window.requestAnimationFrame(updateArrows); });

  // ------ Touch drag (mobile) ------
  let startX = 0, isTouching = false;
  wrap.addEventListener('touchstart', e => {
    if (!e.touches || e.touches.length === 0) return;
    isTouching = true;
    startX = e.touches[0].clientX;
  }, { passive: true });

  wrap.addEventListener('touchmove', e => {
    if (!isTouching || !e.touches || e.touches.length === 0) return;
    const dx = startX - e.touches[0].clientX;
    wrap.scrollLeft += dx;
    startX = e.touches[0].clientX;
  }, { passive: true });

  wrap.addEventListener('touchend', () => { isTouching = false; updateArrows(); });

  // ------ Menu items: activation, keyboard, focus management ------
  const menuItems = Array.from(document.querySelectorAll('.menu-item'));

  function setActiveElement(el) {
    // remove active from all
    menuItems.forEach(x => { x.classList.remove('active'); x.removeAttribute('aria-current'); });
    if (!el) return;
    el.classList.add('active');
    el.setAttribute('aria-current', 'page');

    // đảm bảo phần tử nằm trong vùng visible của wrap
    try {
      const wrapRect = wrap.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      if (elRect.left < wrapRect.left || elRect.right > wrapRect.right) {
        // scroll so that element sits nicely (14% offset left)
        const target = Math.max(0, el.offsetLeft - Math.round(wrap.clientWidth * 0.14));
        smoothScrollTo(wrap, target, 300);
      }
    } catch (e) { /* ignore */ }

    updateArrows();
  }

  // Make menu items keyboard-focusable and bind click
  menuItems.forEach(a => {
    // nếu chưa có tabindex, đặt tabindex để có thể focus
    if (!a.hasAttribute('tabindex')) a.setAttribute('tabindex', '0');

    a.addEventListener('click', (e) => {
      // nếu là <a href="#..."> thì set hash để duy trì state; nếu dẫn ra trang khác (adminOrder.html,...), giữ link
      const href = a.getAttribute('href') || '';
      if (href.startsWith('#')) {
        // cập nhật location.hash -> hashchange sẽ set active
        location.hash = href;
      } else if (href && href.indexOf('#') === 0) {
        // defensive; handled above
        location.hash = href;
      } else {
        // nếu là link trang khác (ví dụ adminOrder.html), vẫn set active cho UX hiện tại
        setActiveElement(a);
      }
      // đảm bảo focus để keyboard người dùng thấy
      a.focus();
    });

    a.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); a.click(); }
      // hỗ trợ mũi tên trái/phải để di chuyển giữa item
      if (e.key === 'ArrowRight') { e.preventDefault(); const next = a.nextElementSibling; if (next && next.classList.contains('menu-item')) { next.focus(); } }
      if (e.key === 'ArrowLeft') { e.preventDefault(); const prev = a.previousElementSibling; if (prev && prev.classList.contains('menu-item')) { prev.focus(); } }
    });
  });

  // ------ Xác định phần tử active dựa trên location.hash hoặc data-route ------
  function setActiveFromLocation() {
    const hash = location.hash || '';
    let sel = null;
    if (hash) {
      sel = document.querySelector(`.menu-item[href="${hash}"]`) || document.querySelector(`.menu-item[data-route="${hash.replace('#','')}"]`);
    }
    // fallback: ưu tiên route="orders" nếu có, hoặc trang báo cáo nếu là adminExport
    if (!sel) {
      sel = document.querySelector('.menu-item[data-route="orders"]') || document.querySelector('.menu-item[data-route="reports"]') || document.querySelector('.menu-item');
    }
    setActiveElement(sel);
  }

  // lắng nghe hashchange và load
  window.addEventListener('hashchange', setActiveFromLocation);
  window.addEventListener('load', () => { setActiveFromLocation(); updateArrows(); });

  // chạy thêm 1 lần sau một khoảng nhỏ để chắc chắn (trường hợp CSS/Fonts thay đổi kích thước)
  setTimeout(() => { setActiveFromLocation(); updateArrows(); }, 160);

  // exposed helper (không bắt buộc) để dev có thể gọi lại khi menu thay đổi động
  window.__adminMenu = {
    refresh: updateArrows,
    setActive: setActiveElement
  };
})();
