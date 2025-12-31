import { getCategories } from '../JS/API/categoryApi.js';
import { getBrands } from '../JS/API/brandApi.js';

class MainNav extends HTMLElement {
  constructor() {
    super();
    this._catsLoaded = false;
    this._brandsLoaded = false;
    this._cats = [];
    this._brands = [];
  }

  connectedCallback() {
    this.innerHTML = `
      <nav class="main-nav">
        <div class="container menu">
          <a href="#" id="all-products">Tất cả</a>

          <div class="dropdown-wrap" id="catWrap">
            <button class="dropdown-btn" id="catBtn">Danh mục ▾</button>
            <div class="dropdown" id="catDropdown" hidden></div>
          </div>

          <div class="dropdown-wrap" id="brandWrap">
            <button class="dropdown-btn" id="brandBtn">Thương hiệu ▾</button>
            <div class="dropdown" id="brandDropdown" hidden></div>
          </div>
        </div>
      </nav>
    `;

    this.adjustPosition();
    window.addEventListener("authChanged", () => this.adjustPosition());

    this.cache();
    this.bindEvents();
  }

  cache() {
    this.catWrap = this.querySelector('#catWrap');
    this.catBtn = this.querySelector('#catBtn');
    this.catDropdown = this.querySelector('#catDropdown');

    this.brandWrap = this.querySelector('#brandWrap');
    this.brandBtn = this.querySelector('#brandBtn');
    this.brandDropdown = this.querySelector('#brandDropdown');
  }

  bindEvents() {
    /* ========== ALL PRODUCTS ========== */
    this.querySelector('#all-products').addEventListener('click', e => {
      e.preventDefault();
      localStorage.clear();
      location.href = 'categoryPage.html';
    });

    /* ========== CATEGORY ========== */
    this.catWrap.addEventListener('mouseenter', () => {
      this.showCategories();
    });

    this.catWrap.addEventListener('mouseleave', () => {
      this.hideCategories();
    });

    this.catBtn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleCategories();
    });

    /* ========== BRAND ========== */
    this.brandWrap.addEventListener('mouseenter', () => {
      this.showBrands();
    });

    this.brandWrap.addEventListener('mouseleave', () => {
      this.hideBrands();
    });

    this.brandBtn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleBrands();
    });

    /* ========== CLICK OUTSIDE ========== */
    document.addEventListener('click', () => {
      this.hideCategories();
      this.hideBrands();
    });
  }

  /* ================= CATEGORIES ================= */
  async showCategories() {
    if (!this._catsLoaded) {
      this.catDropdown.innerHTML = '<div class="loading">Loading...</div>';
      try {
        const cats = await getCategories();
        this._cats = Array.isArray(cats) ? cats : (cats?.data ?? []);
        this._catsLoaded = true;
      } catch {
        this.catDropdown.innerHTML = '<div class="error">Không tải được danh mục</div>';
        return;
      }
    }

    this.catDropdown.innerHTML = this._cats.map(c => `
      <a href="#" class="item"
         data-id="${c.categoryId}"
         data-name="${c.categoryName}">
         ${c.categoryName}
      </a>
    `).join('');

    this.catDropdown.querySelectorAll('.item').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        localStorage.removeItem('brandId');
        localStorage.removeItem('brandName');
        localStorage.setItem('categoryId', a.dataset.id);
        localStorage.setItem('categoryName', a.dataset.name);
        location.href = 'categoryPage.html';
      });
    });

    this.catDropdown.hidden = false;
    this.catWrap.classList.add('open');
  }

  hideCategories() {
    this.catWrap.classList.remove('open');
    this.catDropdown.hidden = true;
  }

  toggleCategories() {
    this.catWrap.classList.contains('open')
      ? this.hideCategories()
      : this.showCategories();
  }

  /* ================= BRANDS ================= */
  async showBrands() {
    if (!this._brandsLoaded) {
      this.brandDropdown.innerHTML = '<div class="loading">Loading...</div>';
      try {
        const brands = await getBrands();
        this._brands = Array.isArray(brands) ? brands : (brands?.data ?? []);
        this._brandsLoaded = true;
      } catch {
        this.brandDropdown.innerHTML = '<div class="error">Không tải được thương hiệu</div>';
        return;
      }
    }

    this.brandDropdown.innerHTML = this._brands.map(b => `
      <a href="#" class="item"
         data-id="${b.brandId}"
         data-name="${b.brandName}">
         ${b.brandName}
      </a>
    `).join('');

    this.brandDropdown.querySelectorAll('.item').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        localStorage.removeItem('categoryId');
        localStorage.removeItem('categoryName');
        localStorage.setItem('brandId', a.dataset.id);
        localStorage.setItem('brandName', a.dataset.name);
        location.href = 'categoryPage.html';
      });
    });

    this.brandDropdown.hidden = false;
    this.brandWrap.classList.add('open');
  }

  hideBrands() {
    this.brandWrap.classList.remove('open');
    this.brandDropdown.hidden = true;
  }

  toggleBrands() {
    this.brandWrap.classList.contains('open')
      ? this.hideBrands()
      : this.showBrands();
  }

  /* ================= POSITION ================= */
  adjustPosition() {
    const nav = this.querySelector('.main-nav');
    const token = localStorage.getItem("accesstoken");
    nav.style.top = token ? "72px" : "110px";
  }
}

customElements.define('main-nav', MainNav);
