/* ================= SPEC ================= */
export function renderSpecs(ctx, state) {
  ctx.specBox.innerHTML = '';

  state.specs
    .filter(s => !s.isDeleted)
    .forEach(s => {
      const row = document.createElement('div');
      row.innerHTML = `
        <input placeholder="Tên" value="${s.k}">
        <input placeholder="Giá trị" value="${s.v}">
        <button>✖</button>
      `;

      row.querySelectorAll('input')[0].oninput = e => s.k = e.target.value;
      row.querySelectorAll('input')[1].oninput = e => s.v = e.target.value;

      row.querySelector('button').onclick = () => {
        s.isDeleted = true;
        renderSpecs(ctx, state);
      };

      ctx.specBox.appendChild(row);
    });
}

/* ================= VARIATIONS ================= */
export function renderVariations(ctx, state, isEdit = false) {
  ctx.variationBox.innerHTML = '';

  /* ================= EDIT MODE ================= */
  if (isEdit) {
    Object.values(state.variations).forEach(v => {
      const label = (v.options || [])
        .map(o => {
          const attr = state.selected.find(a => Number(a.attributeId) === Number(o.attributeId));
          return `${attr?.name ?? ''}: ${o.optionValue}`;
        })
        .join(' | ');

      const row = document.createElement('div');
      row.className = 'variation-row';
      row.innerHTML = `
        <span>${label}</span>
        <input type="number" placeholder="Giá" value="${v.price}">
        <input type="number" placeholder="Tồn kho" value="${v.stock}">
      `;

      const [p, s] = row.querySelectorAll('input');
      p.oninput = e => v.price = Number(e.target.value || 0);
      s.oninput = e => v.stock = Number(e.target.value || 0);

      ctx.variationBox.appendChild(row);
    });

    return;
  }

  /* ================= CREATE MODE (GIỮ NGUYÊN LOGIC CŨ) ================= */

  if (!state.selected.length) return;

  if (state.selected.some(a => !state.values[a.attributeId]?.length)) {
    state.variations = {};
    return;
  }

  const combos = state.selected.reduce(
    (acc, attr) =>
      acc.flatMap(arr =>
        state.values[attr.attributeId].map(v => [
          ...arr,
          { attrId: attr.attributeId, value: v }
        ])
      ),
    [[]]
  );

  const nextVariations = {};

  combos.forEach(combo => {
    const key = combo.map(x => x.value).join('|');

    const existed = state.variations[key] ?? {
      variationId: null,
      price: 0,
      stock: 0,
      options: []
    };

    existed.options = combo.map(x => ({
      optionId: null,
      attributeId: x.attrId,
      optionValue: x.value,
      isDeleted: false
    }));

    nextVariations[key] = existed;

    const label = combo
      .map(x => {
        const attr = state.selected.find(a => Number(a.attributeId) === Number(x.attrId));
        return `${attr?.name ?? ''}: ${x.value}`;
      })
      .join(' | ');

    const row = document.createElement('div');
    row.className = 'variation-row';
    row.innerHTML = `
      <span>${label}</span>
      <input type="number" placeholder="Giá" value="${existed.price}">
      <input type="number" placeholder="Tồn kho" value="${existed.stock}">
    `;

    const [p, s] = row.querySelectorAll('input');
    p.oninput = e => existed.price = Number(e.target.value || 0);
    s.oninput = e => existed.stock = Number(e.target.value || 0);

    ctx.variationBox.appendChild(row);
  });

  state.variations = nextVariations;
}

/* ================= ATTRIBUTE CHIPS ================= */
export function renderAttributeChips(ctx, state, chips, attr) {
  chips.innerHTML = '';

  const list = state.values[attr.attributeId] || [];

  list.forEach(v => {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.innerHTML = `${v}<button>✖</button>`;

    chip.querySelector('button').onclick = () => {
      state.values[attr.attributeId] =
        state.values[attr.attributeId].filter(x => x !== v);

      if (state.values[attr.attributeId].length === 0) {
        delete state.values[attr.attributeId];
        state.selected = state.selected.filter(
          a => Number(a.attributeId) !== Number(attr.attributeId)
        );

        chips.closest('.attr-box')?.remove();
      }

      renderVariations(ctx, state);
      renderAttributeChips(ctx, state, chips, attr);
    };

    chips.appendChild(chip);
  });
}

/* ================= IMAGES ================= */
export function renderImages(ctx, state) {
  ctx.imgList.innerHTML = '';

  (state.images.subs || [])
    .forEach((imgObj, idx) => {
      if (imgObj.isDeleted) return;

      const wrap = document.createElement('div');
      wrap.className = 'img-wrapper';

      const img = document.createElement('img');
      img.src = imgObj.imageUrl || '';
      img.className = 'img-preview';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'img-remove';
      btn.title = 'Xóa ảnh';
      btn.innerText = '✖';

      btn.onclick = e => {
        e.stopPropagation();
        // mark the exact item as deleted and re-render
        if (state.images.subs[idx]) state.images.subs[idx].isDeleted = true;
        renderImages(ctx, state);
      };

      wrap.appendChild(img);
      wrap.appendChild(btn);
      ctx.imgList.appendChild(wrap);
    });
}

/* ================= ATTRIBUTE BOX ================= */
export function renderAttributeBoxFromState(ctx, state, attr) {
  const box = document.createElement('div');
  box.className = 'attr-box';
  box.dataset.attrId = attr.attributeId;

  box.innerHTML = `
    <select disabled>
      <option value="${attr.attributeId}">${attr.name}</option>
    </select>
    <input placeholder="Nhập giá trị, Enter để thêm">
    <div class="chips"></div>
  `;

  const chips = box.querySelector('.chips');
  renderAttributeChips(ctx, state, chips, attr);

  ctx.attrBoxes.appendChild(box);
}
