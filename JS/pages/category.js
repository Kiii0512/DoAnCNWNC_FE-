import { loadProductsByCategoryAndBrand, searchProducts, products } from "../API/productAPI.js";

const params = new URLSearchParams(window.location.search);
const categoryId = params.get("categoryId") || localStorage.getItem("categoryId");
const brandId = localStorage.getItem("brandId");
const keyword = params.get("keyword");

async function loadData() {
  if (keyword) {
    await searchProducts({ keyword: keyword, status: "active" });
  } else {
    await loadProductsByCategoryAndBrand(categoryId, brandId);
  }
}

loadData();
