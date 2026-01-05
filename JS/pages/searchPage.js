import { searchProducts } from "../API/productAPI.js";


async function fetchProducts() {
  const keyword = document.getElementById("q").value.trim();
  const category = document.getElementById("filter-category").value;
  const brand = document.getElementById("filter-brand").value;

  const request = {
    keyword: keyword || undefined,
    status: "active"
  };

  if (category && category !== "all") {
    request.categoryId = category;
  }

  if (brand && brand !== "all") {
    request.brandId = brand;
  }

  try {
    const products = await searchProducts(request);
    renderProducts(products);
  } catch (err) {
    console.error("Lỗi gọi API:", err);
  }
}


function renderProducts(products) {
  const grid = document.getElementById("grid");
  grid.innerHTML = ""; // clear trước

  if (!products || products.length === 0) {
    grid.innerHTML = "<p>Không tìm thấy sản phẩm.</p>";
    return;
  }

  products.forEach(p => {
    const card = `
      <div class="card" onclick="openModal(${p.id})">
        <img src="${p.img}" alt="${p.title}">
        <h3>${p.title}</h3>
        <p class="price">${p.price.toLocaleString()}₫</p>
        <p class="old">${p.old ? p.old.toLocaleString() + "₫" : ""}</p>
      </div>
    `;
    grid.innerHTML += card;
  });
}

document.getElementById("searchBtn").addEventListener("click", () => {
  fetchProducts();
});


document.getElementById("q").addEventListener("keyup", (e) => {
  if (e.key === "Enter") fetchProducts();
});


document.getElementById("filter-category").addEventListener("change", fetchProducts);
document.getElementById("filter-brand").addEventListener("change", fetchProducts);


fetchProducts();

