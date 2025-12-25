// components/app-header.js
class AppHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header>
        <div class="thanh-tren">
          <a class="logo" href="./" aria-label="Về trang chủ">
            <div class="vuong">68</div>
            <div style="font-weight:700">Shop68IT1</div>
          </a>

          <div class="tim-kiem" style="position:relative">
            <div class="search-wrap">
              <input id="timKiemChung" placeholder="Tìm sản phẩm, đơn, khách..." />
              <button id="nutTimKiem" class="nut-gio">
                <span class="btn-label">Tìm</span>
              </button>
            </div>

            <div class="account">
              <button id="nutTaiKhoan"
                class="nut-tk"
                aria-haspopup="true"
                aria-expanded="false"
                aria-controls="accountMenu">
                👤
              </button>

              <div id="accountMenu" class="account-menu" role="menu" aria-hidden="true">
                <div class="account-item" tabindex="0" data-action="profile">Thay đổi thông tin</div>
                <div class="account-item" tabindex="0" data-action="logout">Đăng xuất</div>
              </div>
            </div>
          </div>
        </div>
      </header>
    `;

    this.setupAccountMenu();
    this.setupMobileSearch();
  }

  /* ===============================
     ACCOUNT MENU (logic cũ của bạn)
  =============================== */
  setupAccountMenu() {
    const btn = this.querySelector('#nutTaiKhoan');
    const menu = this.querySelector('#accountMenu');
    const wrapper = this.querySelector('.account');
    if (!btn || !menu) return;

    const openMenu = () => {
      menu.setAttribute('aria-hidden', 'false');
      btn.setAttribute('aria-expanded', 'true');
    };
    const closeMenu = () => {
      menu.setAttribute('aria-hidden', 'true');
      btn.setAttribute('aria-expanded', 'false');
    };

    btn.addEventListener('mouseenter', openMenu);
    btn.addEventListener('focus', openMenu);
    btn.addEventListener('click', () => {
      const isOpen = menu.getAttribute('aria-hidden') === 'false';
      isOpen ? closeMenu() : openMenu();
    });

    wrapper.addEventListener('mouseleave', () => setTimeout(closeMenu, 120));
    wrapper.addEventListener('blur', () => setTimeout(closeMenu, 120), true);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });

    document.addEventListener('click', (e) => {
      if (!this.contains(e.target)) closeMenu();
    });

    menu.addEventListener('click', (e) => {
      const item = e.target.closest('.account-item');
      if (!item) return;

      const action = item.dataset.action;
      closeMenu();

      if (action === 'logout') {
        try { localStorage.removeItem('user'); } catch {}
        this.showToast('Bạn đã đăng xuất');
      }

      if (action === 'profile') {
        this.showToast('Mở trang thay đổi thông tin');
      }
    });

    menu.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') &&
          document.activeElement.classList.contains('account-item')) {
        document.activeElement.click();
      }
    });
  }

  /* ===============================
     MOBILE SEARCH OVERLAY
  =============================== */
  setupMobileSearch() {
    const btnSearch = this.querySelector('#nutTimKiem');
    const inputDesktop = this.querySelector('#timKiemChung');
    if (!btnSearch) return;

    let overlay = null;

    const createOverlay = () => {
      overlay = document.createElement('div');
      overlay.className = 'search-overlay';
      overlay.innerHTML = `
        <div class="search-inner">
          <input placeholder="Tìm sản phẩm, đơn, khách..." />
          <button class="nut-gio">Đóng</button>
        </div>
      `;
      overlay.style.display = 'none';
      document.body.appendChild(overlay);

      overlay.querySelector('button').onclick = () => hide();
      overlay.onclick = (e) => { if (e.target === overlay) hide(); };
    };

    const show = () => {
      if (!overlay) createOverlay();
      overlay.style.display = 'flex';
      overlay.setAttribute('aria-hidden', 'false');
      setTimeout(() => overlay.querySelector('input')?.focus(), 50);
    };

    const hide = () => {
      overlay.style.display = 'none';
      overlay.setAttribute('aria-hidden', 'true');
    };

    btnSearch.addEventListener('click', () => {
      if (window.innerWidth <= 900) {
        show();
      } else {
        inputDesktop?.focus();
      }
    });
  }

  showToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 1500);
  }
}

customElements.define('app-header', AppHeader);
