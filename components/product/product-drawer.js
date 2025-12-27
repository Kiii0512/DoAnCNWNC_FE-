import { createProduct } from '../../JS/API/productAPI.js';
import { buildVariations, buildProductPayload } from '../../JS/pages/productBuilder.js';
import { getCategories } from '../../JS/API/categoryAPI.js';
import { getBrands } from '../../JS/API/brandAPI.js';
import { getAttributes } from '../../JS/API/attributeAPI.js';
import { showToast } from '../../utils/toast.js';

/* =========================
   STATE
========================= */
const state = {
  attributes: [],
  selected: [],
  values: {},
  variations: {},
  specs: [],
  images: {
    main: '',     // URL ảnh chính (bắt buộc)
    subs: []      // URL ảnh phụ (0–3)
  }
};

function resetState() {
  state.selected = [];
  state.values = {};
  state.variations = {};
  state.specs = [];
  state.images = { main: '', subs: [] };
}

/* =========================
   COMPONENT
========================= */
class ProductDrawer extends HTMLElement {
  connectedCallback() {
    this.render();
    this.cache();
    this.bind();
  }

  /* ========================= RENDER ========================= */
  render() {
    this.innerHTML = `
      <div id="backdrop" class="backdrop" hidden></div>

      <aside class="drawer" id="drawer">
        <button id="close">✖</button>
        <h3>Tạo sản phẩm</h3>
        <div class="drawer-content">
            <input id="name" placeholder="Tên sản phẩm" />
            <select id="category"></select>
            <select id="brand"></select>

            <!-- SPECIFICATIONS -->
            <div class="block">
              <label>Thông số kỹ thuật</label>
              <div id="specBox"></div>
              <button id="btnAddSpec" class="btn btn-ghost">+ Thêm thông số</button>
            </div>

            <!-- ATTRIBUTES -->
            <div class="block">
              <label>Thuộc tính biến thể</label>
              <div id="attrBoxes"></div>
              <button id="btnAddAttr" class="btn btn-ghost">+ Thêm thuộc tính</button>
            </div>

            <!-- VARIATIONS -->
            <div class="block">
              <label>Biến thể (giá & tồn kho)</label>
              <div id="variationBox"></div>
            </div>

            <!-- IMAGES -->
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
    this.category = $('#category');
    this.brand = $('#brand');

    this.specBox = $('#specBox');
    this.btnAddSpec = $('#btnAddSpec');

    this.attrBoxes = $('#attrBoxes');
    this.variationBox = $('#variationBox');

    this.imgMain = $('#imgMain');
    this.imgSub = $('#imgSub');
    this.previewMain = $('#previewMain');
    this.imgList = $('#imgList');

    this.btnAddAttr = $('#btnAddAttr');
    this.saveBtn = $('#save');
    this.closeBtn = $('#close');
  }

  /* ========================= EVENTS ========================= */
  bind() {
    this.closeBtn.onclick = () => this.close();
    this.saveBtn.onclick = () => this.save();
    this.btnAddAttr.onclick = () => this.addAttributeBox();
    this.btnAddSpec.onclick = () => this.addSpec();
    this.backdrop.onclick = () => this.close();
    document.addEventListener('keydown', e => {
    if (e.key === 'Escape') this.close();
   }); 
    // MAIN IMAGE URL (bắt buộc)
    this.imgMain.oninput = e => {
      const url = e.target.value.trim();
      state.images.main = url;
      this.previewMain.src = url || '/images/no-image.png';
    };

    // SUB IMAGE URL (Enter để thêm, 0–3)
    this.imgSub.onkeydown = e => {
      if (e.key !== 'Enter') return;
      e.preventDefault();

      const url = e.target.value.trim();
      if (!url) return;

      // Tổng ảnh tối đa = 4 (1 chính + 3 phụ)
      if (state.images.subs.length >= 3) {
        showToast('Tối đa 4 ảnh (1 chính + 3 phụ)');
        return;
      }

      state.images.subs.push(url);
      e.target.value = '';
      this.renderImages();
    };
  }

  /* ========================= OPEN / CLOSE ========================= */
  async open() {
    resetState();
    await this.loadCombos();
    await this.loadAttributes();
    this.addAttributeBox();
    this.drawer.classList.add('open');
    this.backdrop.hidden = false;
  }

  close() {
    this.drawer.classList.remove('open');
    this.backdrop.hidden = true;
  }

  /* ========================= LOAD ========================= */
  async loadCombos() {
    const [cats, brands] = await Promise.all([
      getCategories(),
      getBrands()
    ]);

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
    state.specs.push({ k: '', v: '' });
    this.renderSpecs();
  }

  renderSpecs() {
    this.specBox.innerHTML = '';
    state.specs.forEach((s, i) => {
      const row = document.createElement('div');
      row.innerHTML = `
        <input placeholder="Tên" value="${s.k}">
        <input placeholder="Giá trị" value="${s.v}">
        <button>✖</button>
      `;
      row.querySelectorAll('input')[0].oninput = e => s.k = e.target.value;
      row.querySelectorAll('input')[1].oninput = e => s.v = e.target.value;
      row.querySelector('button').onclick = () => {
        state.specs.splice(i, 1);
        this.renderSpecs();
      };
      this.specBox.appendChild(row);
    });
  }

  /* ========================= ATTR + VAR ========================= */
  addAttributeBox() {
  // 🔒 lấy toàn bộ attributeId đã dùng (kể cả chưa commit)
  const usedAttrIds = [
    ...state.selected.map(a => a.attributeId),
    ...[...this.attrBoxes.querySelectorAll('.attr-box')]
        .map(b => b.dataset.attrId)
        .filter(Boolean)
        .map(Number)
  ];

  const available = state.attributes.filter(
    a => !usedAttrIds.includes(a.attributeId)
  );

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
  let committed = false; // 🔑 đã “chốt” attribute hay chưa

  // 👉 CHỌN ATTRIBUTE (chưa commit)
  select.onchange = () => {
    const attrId = Number(select.value);
    if (!attrId) return;

    // 🔒 kiểm tra trùng với các box khác
    const exists = [...this.attrBoxes.querySelectorAll('.attr-box')]
      .some(b => b !== box && Number(b.dataset.attrId) === attrId);

    if (exists) {
      showToast('Thuộc tính đã được chọn');
      select.value = '';
      return;
    }

    currentAttr = state.attributes.find(a => a.attributeId === attrId);
    if (!currentAttr) return;

    box.dataset.attrId = attrId; // 🔑 GIỮ CHỖ
    input.disabled = false;
  };

  // 👉 NHẬP VALUE → LÚC NÀY MỚI COMMIT
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

    const list = state.values[currentAttr.attributeId];
    if (list.includes(v)) return;

    list.push(v);
    input.value = '';

    this.renderAttributeChips(chips, currentAttr);
    this.renderVariations();
  };

  this.attrBoxes.appendChild(box);
}



  renderVariations() {
  this.variationBox.innerHTML = '';
  state.variations = {};

  if (!state.selected.length) return;

  // 🔒 luôn theo thứ tự attribute đã chọn
  const attrOrder = state.selected.map(a => a.attributeId);

  // nếu có attr nào chưa có value → chưa render
  if (attrOrder.some(id => !state.values[id]?.length)) return;

  // build cartesian product
  const combos = attrOrder.reduce(
    (acc, attrId) =>
      acc.flatMap(arr =>
        state.values[attrId].map(v => [...arr, { attrId, value: v }])
      ),
    [[]]
  );

  combos.forEach(combo => {
    // key ổn định
    const key = combo.map(x => x.value).join('|');

    state.variations[key] ??= { price: 0, stock: 0 };

    const label = combo
      .map(x => {
        const attr = state.selected.find(a => a.attributeId === x.attrId);
        return `${attr.name}: ${x.value}`;
      })
      .join(' - ');

    const row = document.createElement('div');
    row.className = 'variation-row';
    row.innerHTML = `
      <span>${label}</span>
      <input type="number" placeholder="Giá">
      <input type="number" placeholder="Tồn kho">
    `;

    const [p, s] = row.querySelectorAll('input');
    p.oninput = e => state.variations[key].price = +e.target.value;
    s.oninput = e => state.variations[key].stock = +e.target.value;

    this.variationBox.appendChild(row);
  });
}

renderAttributeChips(chips, attr) {
  chips.innerHTML = '';

  const list = state.values[attr.attributeId] || [];

  list.forEach(v => {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.innerHTML = `
      ${v}
      <button type="button">✖</button>
    `;

    chip.querySelector('button').onclick = () => {
      state.values[attr.attributeId] =
      state.values[attr.attributeId].filter(x => x !== v);

      // nếu attribute không còn value → xoá attribute luôn
      if (state.values[attr.attributeId].length === 0) {
        delete state.values[attr.attributeId];
        state.selected = state.selected.filter(
          a => a.attributeId !== attr.attributeId
        );

        const box = chips.closest('.attr-box');
        box.dataset.attrId = ''; // 🔓 giải phóng
        box.remove();
      }

      this.renderVariations();
      this.renderAttributeChips(chips, attr);
    };

    chips.appendChild(chip);
  });
}


  /* ========================= IMAGES ========================= */
  renderImages() {
    this.imgList.innerHTML = '';
    state.images.subs.forEach((url, i) => {
      const img = document.createElement('img');
      img.src = url;
      img.className = 'img-preview';
      img.onerror = () => img.src = '/images/no-image.png';
      img.onclick = () => {
        state.images.subs.splice(i, 1);
        this.renderImages();
      };
      this.imgList.appendChild(img);
    });
  }

  /* ========================= SAVE ========================= */
  async save() {
    try {
      const variations = buildVariations(state);

      if (!variations.length) {
        showToast('Chưa có biến thể');
        return;
      }

      if (!state.images.main) {
        showToast('Chưa nhập link ảnh chính');
        return;
      }

      const product = {
        ...buildProductPayload(this, state, variations),
        images: [
          { imageUrl: state.images.main, isMain: true },
          ...state.images.subs.map(u => ({ imageUrl: u, isMain: false }))
        ]
      };

      await createProduct(product);

      showToast('Tạo sản phẩm thành công');
      this.close();
    } catch (e) {
      console.error(e);
      showToast('Lỗi tạo sản phẩm');
    }
  }
}

customElements.define('product-drawer', ProductDrawer);
export default ProductDrawer;
