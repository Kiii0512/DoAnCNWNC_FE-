import { createProduct, updateProductFull } from '../../JS/API/productAPI.js';
import { getCategories } from '../../JS/API/categoryAPI.js';
import { getBrands } from '../../JS/API/brandAPI.js';
import { getAttributes } from '../../JS/API/attributeAPI.js';
import { showToast } from '../../utils/toast.js';

import { state, resetState } from '../../JS/pages/product/productState.js';
import {
  
  buildUpdateProductPayload
} from '../../JS/pages/product/productBuilder.js';
import {
  renderSpecs,
  renderVariations,
  renderImages,
  renderAttributeChips,
  renderAttributeBoxFromState
} from '../../JS/pages/renderers/ProductRenderer.js';

let editMode = false;
let editingProductId = null;

// ✅ reset nhưng GIỮ snapshot
resetState(true);

/* =========================
   COMPONENT
========================= */
class ProductDrawer extends HTMLElement {
  connectedCallback() {
    this.render();
    this.cache();
    this.bind();

    // wrapper để giữ API cũ
    this.renderSpecs = () => renderSpecs(this, state);
    this.renderVariations = () => renderVariations(this, state, editMode);
    this.renderImages = () => renderImages(this, state);
  }

  /* ========================= RENDER (STATIC HTML) ========================= */
  render() {
    this.innerHTML = `
      <div id="backdrop" class="backdrop" hidden></div>

      <aside class="drawer" id="drawer">
        <button id="close">✖</button>
        <h3>Tạo sản phẩm</h3>

        <div class="drawer-content">
          <input id="name" placeholder="Tên sản phẩm" />
          <div class="block">
            <label>Mô tả</label>
            <textarea id="description" placeholder="Mô tả sản phẩm"></textarea>
          </div>
          <div class="form-row toggle-row">
            <span class="toggle-label">Kích hoạt</span>
            <label class="switch">
              <input type="checkbox" id="isActive" class="switch-input">
              <span class="slider"></span>
            </label>
          </div>
          <select id="category"></select>
          <select id="brand"></select>

          <div class="block">
            <label>Thông số kỹ thuật</label>
            <div id="specBox"></div>
            <button id="btnAddSpec" class="btn btn-ghost">+ Thêm thông số</button>
          </div>

          <div class="block">
            <label>Thuộc tính biến thể</label>
            <div id="attrBoxes"></div>
            <button id="btnAddAttr" class="btn btn-ghost">+ Thêm thuộc tính</button>
          </div>

          <div class="block">
            <label>Biến thể (giá & tồn kho)</label>
            <div id="variationBox"></div>
          </div>

          <div class="block">
            <label>Ảnh sản phẩm (URL)</label>

            <div class="form-row">
              <label>Ảnh chính</label>
              <input id="imgMain" placeholder="https://..." />
              <img id="previewMain" class="img-preview">
            </div>

            <div class="form-row">
              <label>Ảnh phụ (Enter để thêm, tối đa 3)</label>
              <input id="imgSub" placeholder="https://..." />
              <div id="imgList" class="img-preview-list"></div>
            </div>
          </div>
        </div>

        <button id="save" class="btn btn-primary">Lưu</button>
      </aside>
    `;
  }

  /* ========================= CACHE ========================= */
  cache() {
    const $ = id => this.querySelector(id);

    this.drawer = $('#drawer');
    this.backdrop = $('#backdrop');

    this.name = $('#name');
    this.description = $('#description');
    this.isActive = $('#isActive');
    this.category = $('#category');
    this.brand = $('#brand');

    this.specBox = $('#specBox');
    this.attrBoxes = $('#attrBoxes');
    this.variationBox = $('#variationBox');

    this.imgMain = $('#imgMain');
    this.imgSub = $('#imgSub');
    this.previewMain = $('#previewMain');
    this.imgList = $('#imgList');

    this.btnAddSpec = $('#btnAddSpec');
    this.btnAddAttr = $('#btnAddAttr');
    this.saveBtn = $('#save');
    this.closeBtn = $('#close');
  }

  /* ========================= EVENTS ========================= */
  bind() {
    this.closeBtn.onclick = () => this.close();
    this.backdrop.onclick = () => this.close();
    this.saveBtn.onclick = () => this.save();
    this.btnAddSpec.onclick = () => this.addSpec();
    this.btnAddAttr.onclick = () => this.addAttributeBox();

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') this.close();
    });

    this.imgMain.oninput = e => {
      const url = e.target.value.trim();
      state.images.main = url;
      this.previewMain.src = url || '/images/no-image.png';
    };

    this.imgSub.onkeydown = e => {
      if (e.key !== 'Enter') return;
      e.preventDefault();

      const activeSubs = (state.images.subs || []).filter(i => !i.isDeleted).length;
      if (activeSubs >= 3) {
        showToast('Tối đa 4 ảnh (1 chính + 3 phụ)');
        return;
      }

      const url = e.target.value.trim();
      if (!url) return;

      state.images.subs.push({ imageUrl: url, isDeleted: false });
      e.target.value = '';
      this.renderImages();
    };
  }

  /* ========================= OPEN CREATE ========================= */
  async open() {
    editMode = false;
    editingProductId = null;
    resetState();

    await this.loadCombos();
    await this.loadAttributes();

    // clear UI and state for a fresh create form
    this.attrBoxes.innerHTML = '';
    this.variationBox.innerHTML = '';
    this.specBox.innerHTML = '';
    this.imgList.innerHTML = '';

    this.name.value = '';
    if (this.description) this.description.value = '';
    if (this.isActive) this.isActive.checked = true;
    this.category.value = '';
    this.brand.value = '';
    // clear image input fields
    if (this.imgMain) this.imgMain.value = '';
    if (this.imgSub) this.imgSub.value = '';

    state.images = { main: '', mainId: null, subs: [] };
    this.previewMain.src = '/images/no-image.png';

    this.renderSpecs();
    this.renderVariations();
    this.renderImages();

    // ensure active toggle visible for create
    const toggleRow = this.querySelector('.toggle-row');
    if (toggleRow) toggleRow.style.display = 'flex';

    this.drawer.classList.add('open');
    this.backdrop.hidden = false;
  }

  /* ========================= OPEN EDIT ========================= */
  async openEdit(product) {
    // ===== PRODUCT =====
    state.original.product = {
      productName: product.productName,
      productDescription: product.productDescription,
      categoryId: product.categoryId,
      brandId: product.brandId,
      isActive: product.isActive
    };

    // ===== VARIATIONS =====
    state.original.variations = {};
    (product.variations ?? []).forEach(v => {
      state.original.variations[v.variationId] =
        JSON.parse(JSON.stringify(v));
    });

    // ===== SPECIFICATIONS =====
    state.original.specs = {};
    (product.specifications ?? []).forEach(s => {
      state.original.specs[s.specificationId] =
        JSON.parse(JSON.stringify(s));
    });

    // ===== IMAGES =====
    state.original.images = {};
    (product.images ?? []).forEach(i => {
      state.original.images[i.imageId] =
        JSON.parse(JSON.stringify(i));
    });



    editMode = true;
    editingProductId = product.productId;
    // keep original snapshot for diffing
    resetState(true);

    this.attrBoxes.innerHTML = '';
    this.variationBox.innerHTML = '';

    await this.loadCombos();
    await this.loadAttributes();

    this.name.value = product.productName ?? '';
    if (this.description) this.description.value = product.productDescription ?? '';
    // hide the active control in edit mode (toggle via table only)
    const toggleRow = this.querySelector('.toggle-row');
    if (toggleRow) toggleRow.style.display = 'none';
    this.category.value = product.categoryId ?? '';
    this.brand.value = product.brandId ?? '';

    // SPEC
    state.specs = (product.specifications ?? []).map(s => ({
      specificationId: s.specificationId,
      k: s.specKey,
      v: s.specValue,
      isDeleted: false
    }));
    this.renderSpecs();

    // ATTR + VALUES
    (product.variations ?? []).forEach(v => {
      (v.options ?? []).forEach(o => {
        if (!state.values[o.attributeId]) {
          const attr = state.attributes.find(a => Number(a.attributeId) === Number(o.attributeId));
          if (attr) state.selected.push(attr);
          state.values[o.attributeId] = [];
        }
        state.values[o.attributeId].push(o.value);
      });
    });

    state.selected = [...new Map(state.selected.map(a => [a.attributeId, a])).values()];
    Object.keys(state.values).forEach(
      k => state.values[k] = [...new Set(state.values[k])]
    );

    state.selected.forEach(attr =>
      renderAttributeBoxFromState(this, state, attr)
    );

    (product.variations ?? []).forEach(v => {
      const key = state.selected
        .map(a => v.options.find(o => Number(o.attributeId) === Number(a.attributeId))?.value ?? '')
        .join('|');

      state.variations[key] = {
        variationId: v.variationId,
        price: v.price,
        stock: v.stockQuantity,
        options: (v.options ?? []).map(o => ({
          optionId: o.optionId ?? null,
          attributeId: o.attributeId,
          optionValue: o.value,
          isDeleted: false
        }))
      };
    });

    // ================= FIX: rebuild state.selected cho EDIT =================
    state.selected = [];

    (product.variations ?? []).forEach(v => {
      (v.options ?? []).forEach(o => {
        if (!state.selected.some(a => Number(a.attributeId) === Number(o.attributeId))) {
          const attr = state.attributes.find(
            a => Number(a.attributeId) === Number(o.attributeId)
          );
          if (attr) state.selected.push(attr);
        }
      });
    });

    this.renderVariations();

    const main = product.images?.find(i => i.isMain);
    state.images.main = main?.imageUrl ?? '';
    state.images.mainId = main?.imageId ?? null;

    state.images.subs = (product.images ?? [])
      .filter(i => !i.isMain)
      .map(i => ({
        imageId: i.imageId,
        imageUrl: i.imageUrl,
        isDeleted: false
      }));

    this.imgMain.value = state.images.main;
    this.previewMain.src = state.images.main || '/images/no-image.png';
    this.renderImages();

    this.drawer.classList.add('open');
    this.backdrop.hidden = false;
  }

  /* ========================= LOAD DATA ========================= */
  async loadCombos() {
    const [cats, brands] = await Promise.all([getCategories(), getBrands()]);
    this.category.innerHTML = cats.map(c =>
      `<option value="${c.categoryId}">${c.categoryName}</option>`
    ).join('');
    this.brand.innerHTML = brands.map(b =>
      `<option value="${b.brandId}">${b.brandName}</option>`
    ).join('');
  }

  async loadAttributes() {
    state.attributes = await getAttributes();
  }

  /* ========================= SPEC ========================= */
  addSpec() {
    state.specs.push({ k: '', v: '', isDeleted: false });
    this.renderSpecs();
  }

  /* ========================= ATTRIBUTE ========================= */
  addAttributeBox() {
  const usedAttrIds = state.selected.map(a => a.attributeId);
  const available = state.attributes.filter(
    a => !usedAttrIds.includes(a.attributeId)
  );

  if (!available.length) {
    showToast('Không còn thuộc tính để thêm');
    return;
  }

  const box = document.createElement('div');
  box.className = 'attr-box';
  box.dataset.attrId = '';

  box.innerHTML = `
    <select>
      <option value="">-- Chọn thuộc tính --</option>
      ${available.map(a =>
        `<option value="${a.attributeId}">${a.name}</option>`
      ).join('')}
    </select>
    <input placeholder="Nhập giá trị, Enter để thêm" disabled>
    <div class="chips"></div>
  `;

  const select = box.querySelector('select');
  const input  = box.querySelector('input');
  const chips  = box.querySelector('.chips');

  let currentAttr = null;
  let committed = false;

  // 👉 USER CHỌN ATTRIBUTE
  select.onchange = () => {
    const attrId = Number(select.value);
    if (!attrId) return;

    currentAttr = state.attributes.find(a => Number(a.attributeId) === Number(attrId));
    if (!currentAttr) return;

    box.dataset.attrId = attrId;
    input.disabled = false;
  };

  // 👉 USER NHẬP VALUE → LÚC NÀY MỚI COMMIT
  input.onkeydown = e => {
    if (e.key !== 'Enter' || !currentAttr) return;
    e.preventDefault();

    const v = input.value.trim();
    if (!v) return;

    if (!committed) {
      committed = true;
      select.disabled = true;

      state.selected.push(currentAttr);
      state.values[currentAttr.attributeId] = [];
    }

    if (!state.values[currentAttr.attributeId].includes(v)) {
      state.values[currentAttr.attributeId].push(v);
      renderAttributeChips(this, state, chips, currentAttr);
      this.renderVariations();
    }

    input.value = '';
  };

  this.attrBoxes.appendChild(box);
}

  /* ========================= SAVE ========================= */
  async save() {
    try {
      if (!editMode) {
        // ================= CREATE =================
        const variations = Object.values(state.variations)
          .filter(v => Array.isArray(v.options) && v.options.length > 0)
          .map(v => ({
            price: Number(v.price),
            stockQuantity: Number(v.stock),
            options: v.options.map(o => ({
              attributeId: o.attributeId,
              optionValue: o.optionValue
            }))
          }));

        if (!variations.length) {
          showToast('Phải có ít nhất 1 biến thể');
          return;
        }

        const specifications = state.specs
          .filter(s => !s.isDeleted && s.k && s.v)
          .map(s => ({
            specKey: s.k,
            specValue: s.v
          }));

        const images = [];

        if (state.images.main) {
          images.push({ imageUrl: state.images.main, isMain: true });
        }

        state.images.subs
          .filter(i => !i.isDeleted && i.imageUrl)
          .forEach(i => {
            images.push({ imageUrl: i.imageUrl, isMain: false });
          });

        const payload = {
          productName: this.name.value.trim(),
          productDescription: this.description?.value.trim() ?? '',
          categoryId: this.category.value,
          brandId: this.brand.value,
          isActive: this.isActive?.checked ?? true,
          variations,
          specifications,
          images
        };

        await createProduct(payload);
        showToast('Tạo sản phẩm thành công');
      }

      // ================= UPDATE =================
      else {
        const payload = buildUpdateProductPayload(
          editingProductId,
          {
            name: this.name.value.trim(),
            description: this.description?.value ?? '',
            categoryId: this.category.value,
            brandId: this.brand.value,
            isActive: this.isActive?.checked ?? true
          },
          state
        );

        // 🚫 Không có gì thay đổi
        if (Object.keys(payload).length === 1) {
          showToast('Không có thay đổi');
          return;
        }

        await updateProductFull(payload);
        showToast('Cập nhật sản phẩm thành công');
      }

      this.close();
      this.dispatchEvent(new CustomEvent('product-saved', { bubbles: true }));

    } catch (e) {
      console.error(e);
      showToast(e.message || 'Lỗi lưu sản phẩm');
    }
  }

  close() {
    this.drawer.classList.remove('open');
    this.backdrop.hidden = true;
  }
}

customElements.define('product-drawer', ProductDrawer);
export default ProductDrawer;
