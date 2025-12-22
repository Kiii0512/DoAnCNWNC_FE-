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

    // ================================
    // DATA
    // ================================
    const products = [
      {
        img: "https://via.placeholder.com/40",
        name: "iPhone 14 Pro Max",
        category: "Smartphone",
        price: 1299,
        stock: 65,
        status: "Active",
        specs: {
          screen: "6.7 inch OLED",
          cpu: "Apple A16",
          ram: "6GB",
          storage: "256GB",
          battery: "4323 mAh"
        }
      },
      {
        img: "https://via.placeholder.com/40",
        name: "Asus ROG Strix G16",
        category: "Laptop Gaming",
        price: 1899,
        stock: 23,
        status: "Active",
        specs: {
          screen: "16 inch IPS",
          cpu: "Intel Core i7",
          ram: "16GB",
          storage: "1TB SSD",
          battery: "90Wh"
        }
      }
    ];

    // ================================
    // INPUT SPECS (ADD & EDIT)
    // ================================
    const inputSpecs = (old = {}) => {
      return {
        screen: prompt("Màn hình:", old.screen || ""),
        cpu: prompt("CPU:", old.cpu || ""),
        ram: prompt("RAM:", old.ram || ""),
        storage: prompt("Bộ nhớ trong:", old.storage || ""),
        battery: prompt("Pin:", old.battery || "")
      };
    };

    // ================================
    // RENDER TABLE
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
                <span class="view-specs" data-index="${index}" style="cursor:pointer">
                  ${p.name}
                </span>
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
              <i class="edit" data-index="${index}">✏️</i>
              <i class="delete" data-index="${index}">🗑</i>
            </td>
          </tr>
        `;
      });

      attachEvents();
    };

    // ================================
    // EVENTS
    // ================================
    const attachEvents = () => {

      // VIEW SPECS
      this.querySelectorAll(".view-specs").forEach(el => {
        el.addEventListener("click", () => {
          const p = products[el.dataset.index];
          alert(
`Màn hình: ${p.specs.screen}
CPU: ${p.specs.cpu}
RAM: ${p.specs.ram}
Bộ nhớ: ${p.specs.storage}
Pin: ${p.specs.battery}`
          );
        });
      });

      // DELETE
      this.querySelectorAll(".delete").forEach(btn => {
        btn.addEventListener("click", () => {
          const i = btn.dataset.index;
          if (confirm("Xóa sản phẩm này?")) {
            products.splice(i, 1);
            renderTable();
          }
        });
      });

      // EDIT
      this.querySelectorAll(".edit").forEach(btn => {
        btn.addEventListener("click", () => {
          const i = btn.dataset.index;

          const newName = prompt("Tên sản phẩm:", products[i].name);
          if (!newName) return;

          products[i].name = newName;
          products[i].specs = inputSpecs(products[i].specs);

          renderTable();
        });
      });
    };

    // ================================
    // ADD PRODUCT
    // ================================
    this.querySelector("#addProductBtn").addEventListener("click", () => {
      const name = prompt("Tên sản phẩm:");
      if (!name) return;

      const category = prompt("Danh mục:");
      const price = Number(prompt("Giá:"));
      const stock = Number(prompt("Tồn kho:"));

      const specs = inputSpecs();

      products.push({
        img: "https://via.placeholder.com/40",
        name,
        category,
        price,
        stock,
        status: "Active",
        specs
      });

      renderTable();
    });

    // INIT
    renderTable();
  }
}

customElements.define("product-content", productcontent);
