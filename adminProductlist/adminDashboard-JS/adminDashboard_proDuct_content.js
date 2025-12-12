class productcontent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <div class="content">
          <div class="page-title">Product List</div>
          <div class="breadcrumb">Home / Product List</div>

          <div class="tools">
            <input id="searchInput" type="text" placeholder="Tìm sản phẩm..." />
            <button id="addProductBtn">+ Add Product</button>
          </div>

          <div class="table-card">
            <table id="productTable">
              <thead>
                <tr>
                  <th><input type="checkbox" /></th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody></tbody>
            </table>
          </div>
        </div>
        `;
        const products = [
            {
                img: "https://via.placeholder.com/40",
                name: "iPhone 14 Pro Max",
                category: "Smartphone",
                price: 1299,
                stock: 65,
                status: "Active"
            },
            {
                img: "https://via.placeholder.com/40",
                name: "Asus ROG Strix G16",
                category: "Laptop Gaming",
                price: 1899,
                stock: 23,
                status: "Active"
            },
            {
                img: "https://via.placeholder.com/40",
                name: "Loa Bluetooth JBL Charge 5",
                category: "Audio",
                price: 179,
                stock: 0,
                status: "Inactive"
            }
        ];

        // ================================
        // HÀM RENDER BẢNG
        // ================================
        const renderTable = () => {
            const tbody = this.querySelector("#productTable tbody");
            tbody.innerHTML = "";

            products.forEach((p, index) => {
                tbody.innerHTML += `
          <tr>
            <td><input type="checkbox" /></td>

            <td>
              <div class="product-info">
                <img src="${p.img}" />
                ${p.name}
              </div>
            </td>

            <td>${p.category}</td>
            <td>$${p.price}</td>
            <td>${p.stock}</td>

            <td>
              <span class="badge ${p.status === "Active" ? "active" : ""}">
                ${p.status}
              </span>
            </td>

            <td class="actions">
              <button class="edit" data-index="${index}">✏️</button>
              <button class="delete" data-index="${index}">🗑</button>
            </td>
          </tr>
        `;
            });

            attachEvents();
        };

        // ================================
        // GÁN SỰ KIỆN EDIT & DELETE
        // ================================
        const attachEvents = () => {
            // DELETE
            this.querySelectorAll(".delete").forEach(btn => {
                btn.addEventListener("click", () => {
                    const i = btn.dataset.index;
                    products.splice(i, 1);
                    renderTable();
                });
            });

            // EDIT
            this.querySelectorAll(".edit").forEach(btn => {
                btn.addEventListener("click", () => {
                    const i = btn.dataset.index;
                    const newName = prompt("Nhập tên mới:", products[i].name);
                    if (newName) {
                        products[i].name = newName;
                        renderTable();
                    }
                });
            });
        };

        // ================================
        // THÊM SẢN PHẨM (ADD PRODUCT)
        // ================================
        this.querySelector("#addProductBtn").addEventListener("click", () => {
            const name = prompt("Tên sản phẩm:");
            if (!name) return;

            const price = prompt("Giá:");
            const stock = prompt("Tồn kho:");
            const category = prompt("Danh mục:");

            products.push({
                img: "https://via.placeholder.com/40",
                name,
                category,
                price: Number(price),
                stock: Number(stock),
                status: "Active"
            });

            renderTable();
        });

        // render bảng ban đầu
        renderTable();
    }
}

customElements.define("product-content", productcontent);
