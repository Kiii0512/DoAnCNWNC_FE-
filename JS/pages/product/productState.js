/* =========================
   GLOBAL PRODUCT STATE
========================= */

export const state = {
  attributes: [],
  selected: [],
  values: {},
  variations: {},      // key-based (FE)
  specs: [],
  images: {
    main: '',
    mainId: null,
    subs: []
  },

  // 🔴 SNAPSHOT GỐC (dùng để diff)
  original: {
    product: {},
    variations: {},
    specs: {},
    images: {}
  }
};

export function resetState(keepOriginal = false) {
  state.attributes = [];
  state.selected = [];
  state.values = {};
  state.variations = {};
  state.specs = [];
  state.images = {
    main: '',
    mainId: null,
    subs: []
  };

  if (!keepOriginal) {
    state.original = {
      product: {},
      variations: {},
      specs: {},
      images: {}
    };
  }
}
