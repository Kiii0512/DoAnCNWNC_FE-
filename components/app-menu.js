class AppMenu extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <nav class="menu" role="navigation" aria-label="Main menu">
        <div class="menu-nav">
          <div class="scroll-wrap" tabindex="0">
            <div class="scroll-inner" role="menubar">

              <!-- b. QUẢN LÝ SẢN PHẨM -->
              <a class="menu-item"
                 href="#product"
                 data-route="product"
                 title="Thêm mới, sửa, cập nhật giá, hình ảnh, tồn kho">
                Quản lý sản phẩm
                <span class="tag">PRODUCT</span>
              </a>

              <!-- c. QUẢN LÝ ĐƠN HÀNG -->
              <a class="menu-item"
                 href="#order"
                 data-route="order"
                 title="Xác nhận, đóng gói và cập nhật trạng thái đơn hàng">
                Quản lý đơn hàng
                <span class="tag">ORDER</span>
              </a>

              <!-- d. XỬ LÝ PHẢN HỒI -->
              <a class="menu-item"
                 href="#feedback"
                 data-route="feedback"
                 title="Xem, trả lời hoặc xóa phản hồi khách hàng">
                Xử lý phản hồi
                <span class="tag">FEEDBACK</span>
              </a>

              <!-- e. BÁO CÁO DOANH THU -->
              <a class="menu-item"
                 href="#report"
                 data-route="report"
                 title="Xem báo cáo doanh thu">
                Báo cáo doanh thu
                <span class="tag">REPORT</span>
              </a>

            </div>
          </div>

          <button class="nav-arrow left" aria-label="Trượt trái">◀</button>
          <button class="nav-arrow right" aria-label="Trượt phải">▶</button>
        </div>
      </nav>
    `;

    this.wrap  = this.querySelector('.scroll-wrap');
    this.inner = this.querySelector('.scroll-inner');
    this.left  = this.querySelector('.nav-arrow.left');
    this.right = this.querySelector('.nav-arrow.right');
    this.items = Array.from(this.querySelectorAll('.menu-item'));

    this.bindEvents();
    this.setActiveFromLocation();
    this.updateArrows();
  }

  /* ===============================
     ACTIVE ITEM
  =============================== */
  setActiveElement(el) {
    this.items.forEach(x => {
      x.classList.remove('active');
      x.removeAttribute('aria-current');
    });
    if (!el) return;

    el.classList.add('active');
    el.setAttribute('aria-current', 'page');
    this.updateArrows();
  }

  setActiveFromLocation() {
    const route = location.hash.replace('#', '');
    const el =
      this.items.find(x => x.dataset.route === route) ||
      this.items[0];

    this.setActiveElement(el);
  }

  /* ===============================
     SCROLL LOGIC
  =============================== */
  updateArrows() {
    const maxScroll = this.inner.scrollWidth - this.wrap.clientWidth;
    if (maxScroll <= 2) {
      this.left.hidden = true;
      this.right.hidden = true;
      return;
    }
    this.left.hidden  = this.wrap.scrollLeft <= 4;
    this.right.hidden = this.wrap.scrollLeft >= maxScroll - 4;
  }

  doScroll(dir) {
    const step = Math.round(this.wrap.clientWidth * 0.7) || 200;
    const target =
      dir === 'right'
        ? Math.min(this.inner.scrollWidth - this.wrap.clientWidth, this.wrap.scrollLeft + step)
        : Math.max(0, this.wrap.scrollLeft - step);

    this.wrap.scrollTo({ left: target, behavior: 'smooth' });
  }

  /* ===============================
     EVENTS
  =============================== */
  bindEvents() {
  this.left.onclick  = () => this.doScroll('left');
  this.right.onclick = () => this.doScroll('right');

  this.wrap.addEventListener('scroll', () =>
    requestAnimationFrame(() => this.updateArrows())
  );

  window.addEventListener('resize', () => this.updateArrows());

  this.items.forEach(a => {
    a.setAttribute('tabindex', '0');

    a.onclick = (e) => {
      e.preventDefault();               // 🔴 CHỐT HẠ
      location.hash = a.dataset.route;  // ✅ product | order | feedback | report
      this.setActiveElement(a);
    };

    a.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        a.click();
      }
    };
  });

  window.addEventListener('hashchange', () => this.setActiveFromLocation());
}
}

customElements.define('app-menu', AppMenu);
