import { loadProductsFromAPI } from "../API/productApi.js";

const params = new URLSearchParams(window.location.search);
const categoryId = params.get("categoryId");

loadProductsFromAPI(categoryId);