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
    productDescription: '',
    categoryId: ctx.category.value,
    brandId: ctx.brand.value,
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
