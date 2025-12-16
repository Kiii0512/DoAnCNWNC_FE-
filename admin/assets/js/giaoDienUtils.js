/* giaoDienUtils.js
   Các helper giao diện chung (toast, debounce, DOM helpers, event delegation...)
   - Chú thích tiếng Việt
   - Expose các hàm hữu dụng lên window.giaoDienUtils và một số tên tiện lợi (ví dụ showToast)
*/

(function () {
  'use strict';

  /* ====== Toast (thông báo nhỏ góc phải) ======
     - Nếu trong DOM đã có phần tử id="toast" thì dùng nó,
       còn không tự tạo một element tiêu chuẩn để thông báo.
     - Sử dụng class "show" để bật/tắt hiệu ứng (CSS xử lý chuyển tiếp).
  */
  function ensureToastElement() {
    let t = document.getElementById('toast');
    if (t) return t;

    // tạo toast mặc định nếu không tìm thấy
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    t.setAttribute('role', 'status');
    t.setAttribute('aria-live', 'polite');
    t.style.display = 'none';
    document.body.appendChild(t);
    return t;
  }

  let _toastTimer = null;
  let _lastToastText = '';

  /**
   * Hiển thị toast
   * @param {string} msg - Nội dung hiển thị (plain text)
   * @param {number} ms - Thời gian hiển thị (ms). Mặc định 1800
   */
  function showToast(msg, ms = 1800) {
    try {
      const t = ensureToastElement();
      // Nếu nội dung giống hệt toast trước đó và đang hiển thị, reset thời gian
      if (t.classList.contains('show') && String(msg) === _lastToastText) {
        clearTimeout(_toastTimer);
        _toastTimer = setTimeout(() => { hideToast(); }, ms);
        return;
      }

      _lastToastText = String(msg);
      // dùng textContent để tránh HTML injection
      t.textContent = _lastToastText;

      // hiển thị (CSS sẽ chuyển tiếp)
      t.style.display = ''; // restore default
      // force reflow (đảm bảo transition hoạt động)
      void t.offsetWidth;
      t.classList.add('show');

      // clear timer cũ
      clearTimeout(_toastTimer);
      _toastTimer = setTimeout(() => {
        hideToast();
      }, ms);
    } catch (e) {
      // nếu lỗi (ví dụ document chưa sẵn sàng), fallback alert
      try { console.warn('showToast error', e); } catch (_) {}
      // tránh spam alert; chỉ dùng console khi có lỗi
    }
  }

  /**
   * Ẩn toast ngay
   */
  function hideToast() {
    try {
      const t = ensureToastElement();
      t.classList.remove('show');
      // ẩn ngay sau transition; nếu không có transition, 200ms là an toàn
      clearTimeout(_toastTimer);
      _toastTimer = setTimeout(() => {
        try { t.style.display = 'none'; } catch (e) {}
      }, 240);
    } catch (e) { /* ignore */ }
  }

  /* ====== Debounce (trì hoãn) ======
     - Trả về hàm debounced; giống behavior phổ biến
  */
  function debounce(fn, ms = 250) {
    let t;
    return function debounced() {
      const ctx = this;
      const args = arguments;
      clearTimeout(t);
      t = setTimeout(() => {
        fn.apply(ctx, args);
      }, ms);
    };
  }

  /* ====== DOM helpers nhỏ gọn ====== */

  // query selector (first)
  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  // query selector all -> Array
  function qsa(selector, root = document) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  // tạo element từ HTML string (trả về phần tử đầu tiên)
  function createEl(html) {
    const tpl = document.createElement('template');
    tpl.innerHTML = html.trim();
    return tpl.content.firstElementChild;
  }

  // add / remove class tiện lợi
  function addClass(el, cls) { if (el && cls) el.classList.add(cls); }
  function removeClass(el, cls) { if (el && cls) el.classList.remove(cls); }
  function toggleClass(el, cls) { if (el && cls) el.classList.toggle(cls); }

  /* ====== Event helpers: on/off + delegation ======
     - on(el, event, selector?, handler)
       + Nếu selector là string -> delegation (lắng nghe trên el và match closest)
       + Nếu selector là function -> đó chính là handler (không delegation)
  */
  function on(el, eventName, selectorOrHandler, handlerMaybe) {
    if (!el) return;
    // on(el, event, handler)
    if (typeof selectorOrHandler === 'function') {
      const handler = selectorOrHandler;
      el.addEventListener(eventName, handler);
      return { el, eventName, handler };
    }

    // on(el, event, selector, handler)
    const selector = selectorOrHandler;
    const handler = handlerMaybe;
    if (typeof selector !== 'string' || typeof handler !== 'function') return;

    const delegated = function (e) {
      const target = e.target;
      // closest từ target đến el (stop at el)
      const match = target.closest(selector);
      if (match && el.contains(match)) {
        handler.call(match, e);
      }
    };
    el.addEventListener(eventName, delegated);
    return { el, eventName, handler: delegated };
  }

  function off(binding) {
    try {
      if (!binding) return;
      const { el, eventName, handler } = binding;
      el.removeEventListener(eventName, handler);
    } catch (e) { /* ignore */ }
  }

  /* ====== Tiny utility: once() ====== */
  function once(el, eventName, handler) {
    function wrapper(e) {
      try { handler.call(this, e); } finally { el.removeEventListener(eventName, wrapper); }
    }
    el.addEventListener(eventName, wrapper);
  }

  /* ====== Expose API ra window ====== */
  const api = {
    showToast,
    hideToast,
    debounce,
    qs,
    qsa,
    createEl,
    addClass,
    removeClass,
    toggleClass,
    on,
    off,
    once
  };

  try {
    window.giaoDienUtils = window.giaoDienUtils || {};
    Object.assign(window.giaoDienUtils, api);
    // đồng thời expose showToast và debounce ở global để tương thích code hiện có
    window.showToast = window.showToast || showToast;
    window.hideToast = window.hideToast || hideToast;
    window.debounce = window.debounce || debounce;
  } catch (e) {
    console.warn('giaoDienUtils: không thể expose API ra window', e);
  }

  // optional: auto-initialize toast element so DOM ready không bắt buộc
  // (không gây lỗi nếu document.body chưa tồn tại)
  try {
    if (document && document.readyState === 'complete') {
      ensureToastElement();
    } else {
      // nếu DOM chưa sẵn sàng, gọi khi load xong
      window.addEventListener('load', () => { ensureToastElement(); });
    }
  } catch (e) { /* ignore */ }

})();
