class AppMenu extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <nav class="menu" role="navigation" aria-label="Main menu">
        <div class="menu-nav">
          <div class="scroll-wrap" tabindex="0">
            <div class="scroll-inner" role="menubar">
              <a class="menu-item" href="#admin" data-route="admin">Admin Dashboard<span class="tag">ADMIN</span></a>
              <a class="menu-item" href="staffProduct.html" data-route="products">Quản lý sản phẩm <span class="tag">PRODUCTS</span></a>
              <a class="menu-item" href="adminOrder.html" data-route="orders">Quản lý đơn hàng <span class="tag">ORDERS</span></a>
              <a class="menu-item" href="#accounts" data-route="accounts">Quản lý khách hàng <span class="tag">ACCOUNTS</span></a>
            </div>
          </div>

          <button class="nav-arrow left" aria-label="Trượt trái" aria-hidden="true">◀</button>
          <button class="nav-arrow right" aria-label="Trượt phải">▶</button>
        </div>
      </nav>
    `;

    this.wrap = this.querySelector('.scroll-wrap');
    this.inner = this.querySelector('.scroll-inner');
    this.left = this.querySelector('.nav-arrow.left');
    this.right = this.querySelector('.nav-arrow.right');
    this.items = Array.from(this.querySelectorAll('.menu-item'));

    this.bindEvents();
    this.setActiveFromLocation();
    this.updateArrows();
  }

  /* ===============================
     CORE SCROLL LOGIC
  =============================== */
  updateArrows() {
    const maxScroll = this.inner.scrollWidth - this.wrap.clientWidth;
    if (maxScroll <= 2) {
      this.left.hidden = true;
      this.right.hidden = true;
      return;
    }
    this.left.hidden = this.wrap.scrollLeft <= 4;
    this.right.hidden = this.wrap.scrollLeft >= maxScroll - 4;
  }

  doScroll(dir) {
    const step = Math.round(this.wrap.clientWidth * 0.7) || 200;
    const target =
      dir === 'right'
        ? Math.min(this.inner.scrollWidth - this.wrap.clientWidth, this.wrap.scrollLeft + step)
        : Math.max(0, this.wrap.scrollLeft - step);

    this.smoothScrollTo(this.wrap, target, 300);
  }

  smoothScrollTo(elem, to, duration) {
    const start = elem.scrollLeft;
    const change = to - start;
    const startTime = performance.now();

    const animate = (time) => {
      const t = Math.min(1, (time - startTime) / duration);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      elem.scrollLeft = Math.round(start + change * eased);
      if (t < 1) requestAnimationFrame(animate);
      else this.updateArrows();
    };
    requestAnimationFrame(animate);
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

    const wrapRect = this.wrap.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    if (elRect.left < wrapRect.left || elRect.right > wrapRect.right) {
      const target = Math.max(0, el.offsetLeft - Math.round(this.wrap.clientWidth * 0.14));
      this.smoothScrollTo(this.wrap, target, 300);
    }
    this.updateArrows();
  }

  setActiveFromLocation() {
    const hash = location.hash || '';
    let el =
      this.items.find(x => x.getAttribute('href') === hash) ||
      this.items.find(x => x.dataset.route === hash.replace('#', ''));

    if (!el) {
      el =
        this.items.find(x => x.dataset.route === 'products') ||
        this.items[0];
    }
    this.setActiveElement(el);
  }

  /* ===============================
     EVENTS
  =============================== */
  bindEvents() {
    this.right.onclick = () => this.doScroll('right');
    this.left.onclick = () => this.doScroll('left');

    this.wrap.addEventListener('scroll', () => {
      requestAnimationFrame(() => this.updateArrows());
    });

    window.addEventListener('resize', () => this.updateArrows());

    this.items.forEach(a => {
      a.setAttribute('tabindex', '0');
      a.onclick = () => {
        const href = a.getAttribute('href') || '';
        if (href.startsWith('#')) location.hash = href;
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
