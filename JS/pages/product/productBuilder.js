// build variations từ state
export function buildVariations(state) {
  return Object.entries(state.variations).map(([key, val]) => {
    const values = key.split('|');
    return {
      price: val.price,
      stockQuantity: val.stock,
      options: values.map((v, i) => ({
        attributeId: state.selected[i].attributeId,
        optionValue: v
      }))
    };
  });
}

// build product JSON
export function buildProductPayload(ctx, state, variations) {
  return {
    productName: ctx.name.value.trim(),
    productDescription: ctx.description?.value?.trim() ?? '',
    categoryId: ctx.category.value,
    brandId: ctx.brand.value,
    isActive: ctx.isActive?.checked ?? true,
    // isFeatured removed — only isActive supported
    variations,
    specifications: state.specs.map(s => ({
      specKey: s.k,
      specValue: s.v
    })),
    images: [
      { imageKey: 'main', isMain: true },
      ...state.images.subs.map((_, i) => ({
        imageKey: `sub${i}`,
        isMain: false
      }))
    ]
  };
}

export function buildUpdateProductPayload(productId, ui, state) {
  const payload = { productId };
  const op = state.original.product;

  /* ================= PRODUCT ================= */
  if (ui.name !== op.productName)
    payload.productName = ui.name;

  if (ui.description !== op.productDescription)
    payload.productDescription = ui.description;

  if (ui.categoryId !== op.categoryId)
    payload.categoryId = ui.categoryId;

  if (ui.brandId !== op.brandId)
    payload.brandId = ui.brandId;

  if (typeof ui.isActive !== 'undefined' && ui.isActive !== op.isActive)
    payload.isActive = ui.isActive;

  // isFeatured removed — no-op

  /* ================= VARIATIONS ================= */
  const variations = [];

  Object.values(state.variations).forEach(v => {
      // ➕ ADD
      if (!v.variationId) {
        variations.push({
          variationId: null,
          price: v.price,
          stockQuantity: v.stock,
          isDeleted: false,
          options: v.options.map(o => ({
            optionId: null,
            attributeId: o.attributeId,
            optionValue: o.optionValue,
            isDeleted: false
          }))
        });
        return;
      }

      const old = state.original.variations[v.variationId];
      if (!old) return;

      // ✅ CHỈ SO SÁNH PRICE / STOCK / DELETE
      const changed =
        Number(old.price) !== Number(v.price) ||
        Number(old.stockQuantity) !== Number(v.stock) ||
        v.isDeleted;

      if (changed) {
        variations.push({
          variationId: v.variationId,
          price: v.price,
          stockQuantity: v.stock,
          isDeleted: !!v.isDeleted
          // ❌ KHÔNG GỬI OPTIONS
        });
      }
    });

  if (variations.length) payload.variations = variations;

  /* ================= SPECIFICATIONS ================= */
  const specs = [];

  state.specs.forEach(s => {
    if (!s.specificationId) {
      specs.push({
        specificationId: null,
        specKey: s.k,
        specValue: s.v,
        isDeleted: false
      });
      return;
    }

    const old = state.original.specs[s.specificationId];
    if (!old) return;

    if (
      old.specKey !== s.k ||
      old.specValue !== s.v ||
      s.isDeleted
    ) {
      specs.push({
        specificationId: s.specificationId,
        specKey: s.k,
        specValue: s.v,
        isDeleted: !!s.isDeleted
      });
    }
  });

  if (specs.length) payload.specifications = specs;

  /* ================= IMAGES ================= */
  const images = [];

  // MAIN
  if (state.images.mainId) {
    const old = state.original.images[state.images.mainId];
    if (!old || old.imageUrl !== state.images.main) {
      images.push({
        imageId: state.images.mainId,
        imageUrl: state.images.main,
        isMain: true,
        isDeleted: false
      });
    }
  } else if (state.images.main) {
    images.push({
      imageId: null,
      imageUrl: state.images.main,
      isMain: true,
      isDeleted: false
    });
  }

  // SUB
  state.images.subs.forEach(i => {
    if (!i.imageId) {
      images.push({
        imageId: null,
        imageUrl: i.imageUrl,
        isMain: false,
        isDeleted: false
      });
      return;
    }

    const old = state.original.images[i.imageId];
    if (!old) return;

    if (i.isDeleted) {
      images.push({
        imageId: i.imageId,
        imageUrl: old.imageUrl,
        isMain: false,
        isDeleted: true
      });
    }
  });

  if (images.length) payload.images = images;

  return payload;
}
