import { getProductById } from '../../JS/API/productAPI.js';
import { dinhVND } from '../../utils/format.js';

class ProductDetailDrawer extends HTMLElement {
  constructor() {
    super();
    this.product = null;
  }

  connectedCallback() {
    this.render();
    this.cache();
    this.bind();
  }

  /* ================= RENDER ================= */
  render() {
    this.innerHTML = `
      <div class="backdrop" hidden></div>

      <aside class="drawer detail-drawer">
        <button class="close-btn" type="button">✖</button>
        <h3>Chi tiết sản phẩm</h3>

        <div class="drawer-content">

          <!-- BASIC -->
          <section class="detail-section">
            <h4>Thông tin chung</h4>

            <div class="kv">
              <span>Mã</span>
              <strong id="pid"></strong>
            </div>

            <div class="kv">
              <span>Tên</span>
              <strong id="pname"></strong>
            </div>

            <div class="kv">
              <span>Danh mục</span>
              <strong id="pcate"></strong>
            </div>

            <div class="kv">
              <span>Hãng</span>
              <strong id="pbrand"></strong>
            </div>

            <div class="kv">
              <span>Giá</span>
              <strong id="pprice"></strong>
            </div>

            <div class="kv">
              <span>Tồn kho</span>
              <strong id="pstock"></strong>
            </div>
          </section>

          <!-- DESC -->
          <section class="detail-section">
            <h4>Mô tả</h4>
            <textarea id="pdesc" readonly></textarea>
          </section>

          <!-- VARIATIONS -->
          <section class="detail-section">
            <h4>Biến thể</h4>
            <div id="variations"></div>
          </section>

          <!-- SPECS -->
          <section class="detail-section">
            <h4>Thông số kỹ thuật</h4>
            <ul id="specs" class="spec-list"></ul>
          </section>

          <!-- IMAGES -->
          <section class="detail-section">
            <h4>Hình ảnh</h4>
            <div id="images" class="img-preview-list"></div>
          </section>

        </div>

        <div class="drawer-actions">
          <button class="btn btn-primary" id="btnEdit" type="button">
            Sửa
          </button>
        </div>
      </aside>
    `;
  }

  /* ================= CACHE ================= */
  cache() {
    const $ = s => this.querySelector(s);

    this.backdrop = $('.backdrop');
    this.drawer   = $('.detail-drawer');
    this.btnClose = $('.close-btn');
    this.btnEdit  = $('#btnEdit');

    this.pid    = $('#pid');
    this.pname  = $('#pname');
    this.pcate  = $('#pcate');
    this.pbrand = $('#pbrand');
    this.pprice = $('#pprice');
    this.pstock = $('#pstock');
    this.pdesc  = $('#pdesc');

    this.vBox = $('#variations');
    this.sBox = $('#specs');
    this.iBox = $('#images');
  }

  /* ================= EVENTS ================= */
  bind() {
    this.btnClose.onclick = () => this.close();
    this.backdrop.onclick = () => this.close();

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') this.close();
    });

    // 👉 YÊU CẦU SỬA → CHUYỂN SANG PRODUCT DRAWER
    this.btnEdit.onclick = () => {
      if (!this.product) return;

      this.dispatchEvent(new CustomEvent('product-edit-request', {
        bubbles: true,
        detail: this.product
      }));

      this.close();
    };
  }

  /* ================= OPEN ================= */
  async open(productId) {
    if (!productId) return;

    this.backdrop.hidden = false;
    this.drawer.classList.add('open');

    try {
      const res = await getProductById(productId);
      this.product = res;

      if (!this.product) {
        console.error('Product not found');
        return;
      }

      this.renderData();
    } catch (e) {
      console.error('Load product detail failed', e);
    }
  }

  /* ================= CLOSE ================= */
  close() {
    this.backdrop.hidden = true;
    this.drawer.classList.remove('open');
    this.product = null;
  }

  /* ================= RENDER DATA ================= */
  renderData() {
    const p = this.product;
    if (!p) return;

    // BASIC
    this.pid.textContent    = p.productId ?? '';
    this.pname.textContent  = p.productName ?? '';
    this.pcate.textContent  = p.categoryName ?? '';
    this.pbrand.textContent = p.brandName ?? '';
    this.pprice.textContent = dinhVND(p.productPrice ?? 0);
    this.pstock.textContent = p.totalStock ?? 0;
    this.pdesc.value  = p.productDescription ?? '';

    // VARIATIONS
    this.vBox.innerHTML = '';
    (p.variations ?? []).forEach(v => {
      const div = document.createElement('div');
      div.className = 'variation-card';
      div.innerHTML = `
        <div class="opts">
          ${v.options.map(o =>
            `<strong>${o.attributeName}</strong>: ${o.value}`
          ).join(' | ')}
        </div>
        <div class="meta">
          <span>Giá: ${dinhVND(v.price)}</span>
          <span>Tồn: ${v.stockQuantity}</span>
        </div>
      `;
      this.vBox.appendChild(div);
    });

    // SPECS
    this.sBox.innerHTML = '';
    (p.specifications ?? []).forEach(s => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span>${s.specKey}</span>
        <strong>${s.specValue}</strong>
      `;
      this.sBox.appendChild(li);
    });

    // IMAGES
    this.iBox.innerHTML = '';

    console.debug('product-detail: images array =', p.images);

    (p.images ?? []).forEach((img, idx) => {
      const wrap = document.createElement('div');
      wrap.className = 'detail-img-wrap';

      const el = document.createElement('img');
      // defensive: try multiple possible url keys
      const src = img.imageUrl || img.url || img.image || img.path || '';
      console.debug(`product-detail: image[${idx}] src =`, src, 'raw=', img);
      el.src = src || 'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg';
      el.alt = img.alt ?? '';
      el.onerror = () => { el.src = 'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg'; };

      wrap.appendChild(el);

      if (img.isMain) {
        const badge = document.createElement('span');
        badge.className = 'main-badge';
        badge.textContent = 'MAIN';
        wrap.appendChild(badge);
      }

      this.iBox.appendChild(wrap);
    });
  }
}

customElements.define('product-detail-drawer', ProductDetailDrawer);
export default ProductDetailDrawer;
