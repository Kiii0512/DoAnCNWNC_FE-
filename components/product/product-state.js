// ✅ components/product/product-state.js
export const productState = {
  editingId: null,
  specs: [],
  colors: [],
  caps: [],
  images: { main:null, thumbs:[] }
};

export function resetProductState(){
  productState.editingId = null;
  productState.specs = [];
  productState.colors = [];
  productState.caps = [];
  productState.images = { main:null, thumbs:[] };
}
