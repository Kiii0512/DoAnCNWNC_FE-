const input = document.getElementById("search-input");
const sortSelect = document.getElementById("sort");
const searchBtn = document.getElementById("search-btn");
searchBtn.onclick = () => {
    const keyword = input.value;
    let result = searchProducts(keyword);
};

sortSelect.onchange = () => {
    const keyword = input.value;
    let result = searchProducts(keyword);
    result = sortProducts(result, sortSelect.value);
    renderProducts(result, keyword);
};


function searchProducts(keyword) {
    keyword = keyword.trim().toLowerCase();

    const results = products.filter(item =>
        item.name.toLowerCase().includes(keyword) ||
        item.category.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword)
    );

    renderProducts(results, keyword);  // có highlight
}

function sortProducts(list, type) {
    if (type === "price-asc") list.sort((a, b) => a.price - b.price);
    if (type === "price-desc") list.sort((a, b) => b.price - a.price);
    if (type === "popular") list.sort((a, b) => b.id - a.id); // giả sử id lớn hơn là mới hơn

    return list;
}

function filterByPrice(list, min, max) {
    return list.filter(item => item.price >= min && item.price <= max);
}

function highlight(text, keyword) {
    if (!keyword) return text;
    const regex = new RegExp(`(${keyword})`, "gi");
    return text.replace(regex, `<span class="highlight">$1</span>`);
}

function renderProducts(list, keyword = "") {
    const grid = document.getElementById("grid");
    grid.innerHTML = "";

    if (list.length === 0) {
        grid.innerHTML = "<p style='text-align:center;'>Không tìm thấy sản phẩm.</p>";
        return;
    }

    list.forEach(item => {
        grid.innerHTML += `
            <div class="product-card">
                <img src="${item.image}">
                <h3>${highlight(item.name, keyword)}</h3>
                <p>${highlight(item.category, keyword)}</p>
                <span class="price">${item.price.toLocaleString()}₫</span>
            </div>
        `;
    });
}
