// ==========================
// HÀM GỌI API BACKEND
// ==========================
async function fetchProducts() {
  const q = document.getElementById("q").value.trim();
  const category = document.getElementById("filter-category").value;
  const brand = document.getElementById("filter-brand").value;
  const price = document.getElementById("filter-price").value;
  const sort = document.getElementById("sort").value;

  // Tách khoảng giá
  let min = "";
  let max = "";
  if (price.includes("-")) {
    const range = price.split("-");
    min = range[0];
    max = range[1];
  }

  try {
    const res = await fetch(
      `http://localhost:3000/api/products?q=${q}&category=${category}&brand=${brand}&min=${min}&max=${max}&sort=${sort}`
    );

    const data = await res.json();
    renderProducts(data);
  } catch (err) {
    console.error("Lỗi gọi API:", err);
  }
}

// ==========================
// HÀM ĐỔ SẢN PHẨM RA HTML
// ==========================
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

// ==========================
// GỌI API KHI TÌM KIẾM
// ==========================
document.getElementById("searchBtn").addEventListener("click", () => {
  fetchProducts();
});

// Enter để tìm kiếm
document.getElementById("q").addEventListener("keyup", (e) => {
  if (e.key === "Enter") fetchProducts();
});

// ==========================
// GỌI API KHI FILTER / SORT
// ==========================
document.getElementById("filter-category").addEventListener("change", fetchProducts);
document.getElementById("filter-brand").addEventListener("change", fetchProducts);
document.getElementById("filter-price").addEventListener("change", fetchProducts);
document.getElementById("sort").addEventListener("change", fetchProducts);

// ==========================
// LẦN ĐẦU LOAD TRANG
// ==========================
fetchProducts();
