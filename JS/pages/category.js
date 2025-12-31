import { loadProductsByCategoryAndBrand, searchProducts, products } from "../API/productAPI.js";

const params = new URLSearchParams(window.location.search);
const categoryId = params.get("categoryId") || localStorage.getItem("categoryId");
const brandId = localStorage.getItem("brandId");
const keyword = params.get("keyword");

// Load products based on search keyword or category/brand
async function loadData() {
  if (keyword) {
    // Search mode - call search API with CORRECT lowercase params
    await searchProducts({ keyword: keyword, status: "active" });
  } else {
    // Normal mode - load by category and/or brand
    await loadProductsByCategoryAndBrand(categoryId, brandId);
  }
}

loadData();
