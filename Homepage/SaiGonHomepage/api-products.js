// ===============================
// LOAD PRODUCTS FROM API
// ===============================

// Mảng lưu trữ sản phẩm từ API
let products = [];

// Hàm bất đồng bộ để load sản phẩm từ API
async function loadProducts() {
  try {
    // Gọi API lấy danh sách sản phẩm
    const res = await fetch("YOUR_API/api/products");
    
    // Chuyển dữ liệu trả về sang JSON
    products = await res.json();

    // Hiển thị sản phẩm lên grid
    renderCards(products);

    // Cập nhật giỏ hàng (nếu có sản phẩm đã chọn trước đó)
    updateCartUI();
  } catch (err) {
    // Hiển thị lỗi nếu API không gọi được
    console.error("API Error:", err);
  }
}

// ===============================
// SEARCH & SORT
// ===============================

// Khi click nút search
document.getElementById('searchBtn').addEventListener('click', () => {
  // Lấy giá trị input, chuyển về chữ thường
  const q = document.getElementById('q').value.toLowerCase();
  
  // Lọc sản phẩm có tiêu đề chứa từ khóa
  const filtered = products.filter(p => p.title.toLowerCase().includes(q));
  
  // Render lại các sản phẩm đã lọc
  renderCards(filtered);
});

// Khi thay đổi dropdown sort
document.getElementById('sort').addEventListener('change', (e) => {
  // Sao chép mảng sản phẩm để sắp xếp
  let list = [...products];

  // Sắp xếp tăng dần theo giá
  if (e.target.value === "price-asc") list.sort((a, b) => a.price - b.price);

  // Sắp xếp giảm dần theo giá
  if (e.target.value === "price-desc") list.sort((a, b) => b.price - a.price);

  // Render lại các sản phẩm sau khi sort
  renderCards(list);
});
