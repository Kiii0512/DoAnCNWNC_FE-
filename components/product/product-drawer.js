import {
  createProduct,
  createVariation,
  createSpecifications,
  createImages
} from '../../JS/API/productAPI.js';

import { showToast } from '../../utils/toast.js';
import { productState, resetProductState } from './product-state.js';

class ProductDrawer extends HTMLElement {
  connectedCallback() {
    this.cacheDom();
    this.bindEvents();
  }

  /* ==========================
     CACHE DOM (FIX GỐC)
  ========================== */
  cacheDom() {
    const $ = (id) => this.querySelector(id);

    this.drawer = $('#drawerSP');
    this.backdrop = $('#backdrop');

    // form fields
    this.spTen = $('#spTen');
    this.spGia = $('#spGia');
    this.spTon = $('#spTon');
    this.spMoTa = $('#spMoTa');

    // specs / colors / caps
    this.specsBox = $('#specsBox');
    this.colorsList = $('#colorsList');
    this.capsList = $('#capsList');

    // buttons
    this.btnSave = $('#btnLuuSP');
    this.btnCancel = $('#btnHuy');
    this.btnClose = $('#btnDongDrawer');
    this.btnAddSpec = $('#btnAddSpec');
    this.btnAddColor = $('#btnAddColor');
    this.btnAddCap = $('#btnAddCap');

    // inputs
    this.colorInput = $('#colorInput');
    this.capInput = $('#capInput');
  }

  /* ==========================
     EVENTS (CHỐNG NULL)
  ========================== */
  bindEvents() {
    if (!this.btnSave) {
      console.error('ProductDrawer: DOM chưa render xong');
      return;
    }

    this.btnSave.addEventListener('click', () => this.save());
    this.btnCancel?.addEventListener('click', () => this.close());
    this.btnClose?.addEventListener('click', () => this.close());
    this.backdrop?.addEventListener('click', () => this.close());

    this.btnAddSpec?.addEventListener('click', () => this.addSpec());
    this.btnAddColor?.addEventListener('click', () => this.addColor());
    this.btnAddCap?.addEventListener('click', () => this.addCap());
  }

  /* ==========================
     OPEN / CLOSE
  ========================== */
  open() {
    resetProductState();
    this.resetForm();

    this.drawer?.classList.add('open');
    if (this.backdrop) this.backdrop.hidden = false;
  }

  close() {
    this.drawer?.classList.remove('open');
    if (this.backdrop) this.backdrop.hidden = true;
  }

  resetForm() {
    if (!this.spTen) return;

    this.spTen.value = '';
    this.spGia.value = '';
    this.spTon.value = 1;
    this.spMoTa.value = '';

    this.renderSpecs();
    this.renderColors();
    this.renderCaps();
  }

  /* ==========================
     SPECS
  ========================== */
  addSpec() {
    productState.specs.push({ k: '', v: '' });
    this.renderSpecs();
  }

  renderSpecs() {
    if (!this.specsBox) return;
    this.specsBox.innerHTML = '';

    productState.specs.forEach((s, i) => {
      const row = document.createElement('div');
      row.className = 'spec-row';
      row.innerHTML = `
        <input placeholder="Thuộc tính" value="${s.k}">
        <input placeholder="Giá trị" value="${s.v}">
        <button class="btn btn-ghost">✖</button>
      `;
      row.querySelectorAll('input')[0].oninput = e => s.k = e.target.value;
      row.querySelectorAll('input')[1].oninput = e => s.v = e.target.value;
      row.querySelector('button').onclick = () => {
        productState.specs.splice(i, 1);
        this.renderSpecs();
      };
      this.specsBox.appendChild(row);
    });
  }

  /* ==========================
     COLORS
  ========================== */
  addColor() {
    const v = this.colorInput?.value.trim();
    if (!v || productState.colors.includes(v)) return;
    productState.colors.push(v);
    this.colorInput.value = '';
    this.renderColors();
  }

  renderColors() {
    if (!this.colorsList) return;
    this.colorsList.innerHTML = '';

    productState.colors.forEach((c, i) => {
      const chip = document.createElement('div');
      chip.className = 'chip';
      chip.innerHTML = `${c} <button>✖</button>`;
      chip.querySelector('button').onclick = () => {
        productState.colors.splice(i, 1);
        this.renderColors();
      };
      this.colorsList.appendChild(chip);
    });
  }

  /* ==========================
     CAPS
  ========================== */
  addCap() {
    const v = this.capInput?.value.trim();
    if (!v || productState.caps.includes(v)) return;
    productState.caps.push(v);
    this.capInput.value = '';
    this.renderCaps();
  }

  renderCaps() {
    if (!this.capsList) return;
    this.capsList.innerHTML = '';

    productState.caps.forEach((c, i) => {
      const chip = document.createElement('div');
      chip.className = 'chip';
      chip.innerHTML = `${c} <button>✖</button>`;
      chip.querySelector('button').onclick = () => {
        productState.caps.splice(i, 1);
        this.renderCaps();
      };
      this.capsList.appendChild(chip);
    });
  }

  /* ==========================
     SAVE FLOW (GIỮ NGUYÊN LOGIC)
  ========================== */
  async save() {
    try {
      const categoryId = 'CAT_001';
      const brandId = 'BRD_001';

      const product = await createProduct({
        productName: this.spTen.value.trim(),
        productDescription: this.spMoTa.value.trim(),
        categoryId,
        brandId
      });

      const productId = product.productId;

      if (productState.colors.length && productState.caps.length) {
        for (const c of productState.colors) {
          for (const cap of productState.caps) {
            await createVariation({
              productId,
              price: Number(this.spGia.value),
              stockQuantity: Number(this.spTon.value),
              options: [
                { optionName: 'Color', optionValue: c },
                { optionName: 'Capacity', optionValue: cap }
              ]
            });
          }
        }
      } else {
        await createVariation({
          productId,
          price: Number(this.spGia.value),
          stockQuantity: Number(this.spTon.value),
          options: []
        });
      }

      if (productState.specs.length) {
        await createSpecifications({
          productId,
          specifications: productState.specs.map(s => ({
            specKey: s.k,
            specValue: s.v
          }))
        });
      }

      if (productState.images.main || productState.images.thumbs.length) {
        const imgs = [];
        if (productState.images.main)
          imgs.push({ imageUrl: productState.images.main, isMain: true });

        productState.images.thumbs.forEach(u =>
          imgs.push({ imageUrl: u, isMain: false })
        );

        await createImages({ productId, images: imgs });
      }

      showToast('Tạo sản phẩm thành công');
      this.close();

      this.dispatchEvent(
        new CustomEvent('product-created', { bubbles: true })
      );

    } catch (e) {
      console.error(e);
      showToast('Lỗi khi lưu sản phẩm');
    }
  }
}

customElements.define('product-drawer', ProductDrawer);
