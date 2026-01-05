class AppMenu extends HTMLElement {

  connectedCallback() {
    const role = (localStorage.getItem("role") || "").toLowerCase();

    // Nếu không có role → không render menu
    if (!role) {
      this.innerHTML = "";
      return;
    }

    this.innerHTML = `
      <nav class="menu" role="navigation" aria-label="Main menu">
        <div class="menu-nav">
          <div class="scroll-wrap" tabindex="0">
            <div class="scroll-inner" role="menubar">

              <a class="menu-item" data-route="product" data-roles="admin,staff"
                href="adminDashboard.html">
                Quản lý sản phẩm <span class="tag">PRODUCT</span>
              </a>

              <a class="menu-item" data-route="order" data-roles="admin,staff"
                href="adminOrder.html">
                Quản lý đơn hàng <span class="tag">ORDER</span>
              </a>

              <a class="menu-item" data-route="catalog" data-roles="admin"
                href="adminCatalog.html">
                Quản lý danh mục & thương hiệu <span class="tag">CATALOG</span>
              </a>

              <a class="menu-item" data-route="discount" data-roles="admin"
                href="adminDiscount.html">
                Quản lý khuyến mãi <span class="tag">PROMOTION</span>
              </a>

              <a class="menu-item" data-route="employee" data-roles="admin"
                href="adminEmployee.html">
                Quản lý nhân viên <span class="tag">EMPLOYEE</span>
              </a>

              <a class="menu-item" data-route="feedback" data-roles="admin,staff"
                href="adminFeedback.html">
                Xử lý phản hồi <span class="tag">FEEDBACK</span>
              </a>

              <a class="menu-item" data-route="report" data-roles="admin,staff"
                href="adminReport.html">
                Báo cáo doanh thu <span class="tag">REPORT</span>
              </a>

            </div>
          </div>

          <button class="nav-arrow left" aria-label="Trượt trái">◀</button>
          <button class="nav-arrow right" aria-label="Trượt phải">▶</button>
        </div>
      </nav>
    `;

    this.wrap = this.querySelector(".scroll-wrap");
    this.inner = this.querySelector(".scroll-inner");
    this.left = this.querySelector(".nav-arrow.left");
    this.right = this.querySelector(".nav-arrow.right");

    // Lọc menu theo role
    this.items = Array.from(this.querySelectorAll(".menu-item"))
      .filter(item => {
        const roles = item.dataset.roles.split(",");
        const allowed = roles.includes(role);
        if (!allowed) item.remove();
        return allowed;
      });

    if (!this.items.length) {
      this.innerHTML = "";
      return;
    }

    this.bindEvents();
    this.setActiveFromLocation();
    this.updateArrows();
  }

  /* ===============================
     ACTIVE ITEM
  =============================== */
  setActiveElement(el) {
    this.items.forEach(x => {
      x.classList.remove("active");
      x.removeAttribute("aria-current");
    });

    if (!el) return;

    el.classList.add("active");
    el.setAttribute("aria-current", "page");
    this.updateArrows();
  }

  setActiveFromLocation() {
    const path = location.pathname.toLowerCase();

    const map = {
      adminorder: "order",
      admindiscount: "discount",
      admincatalog: "catalog",
      admindashboard: "product",
      adminemployee: "employee",
      adminfeedback: "feedback",
      adminreport: "report",
    };

    const route =
      Object.entries(map).find(([k]) => path.includes(k))?.[1];

    const el =
      this.items.find(x => x.dataset.route === route) ||
      this.items[0];

    this.setActiveElement(el);
  }

  /* ===============================
     SCROLL
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
      dir === "right"
        ? Math.min(this.inner.scrollWidth - this.wrap.clientWidth, this.wrap.scrollLeft + step)
        : Math.max(0, this.wrap.scrollLeft - step);

    this.wrap.scrollTo({ left: target, behavior: "smooth" });
  }

  /* ===============================
     EVENTS
  =============================== */
  bindEvents() {
    this.left.onclick = () => this.doScroll("left");
    this.right.onclick = () => this.doScroll("right");

    this.wrap.addEventListener("scroll", () =>
      requestAnimationFrame(() => this.updateArrows())
    );

    window.addEventListener("resize", () => this.updateArrows());

    this.items.forEach(a => {
      a.tabIndex = 0;

      a.onclick = () => this.setActiveElement(a);

      a.onkeydown = e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          a.click();
        }
      };
    });

    window.addEventListener("hashchange", () =>
      this.setActiveFromLocation()
    );
  }
}

customElements.define("app-menu", AppMenu);
