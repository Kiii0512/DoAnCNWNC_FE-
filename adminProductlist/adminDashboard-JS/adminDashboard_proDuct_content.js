class productcontent extends HTMLElement {
  connectedCallback() {

    /* ======================================================
       1. HTML TEMPLATE
       - Giao diện danh sách sản phẩm
       - Modal dùng chung cho Add & Edit
       ====================================================== */
    this.innerHTML = `
    <div class="content">
      <div class="page-title">Product List</div>
      <div class="breadcrumb">Home / Product List</div>

      <!-- TOOLBAR: tìm kiếm + thêm sản phẩm -->
      <div class="tools">
        <input id="searchInput" type="text"
               placeholder="Tìm theo ID, tên, CPU, GPU..." />
        <button id="addProductBtn">+ Add Product</button>
      </div>

      <div class="table-card">

        <!-- ========== MODAL ADD / EDIT PRODUCT ========== -->
        <div class="pm-modal" id="pmModal">
          <div class="pm-box">

            <!-- Header modal -->
            <div class="pm-header">
              <span id="pmTitle">Thêm sản phẩm</span>
              <span class="pm-close">&times;</span>
            </div>

            <!-- Body modal -->
            <div class="pm-body">

              <!-- LEFT: upload & preview nhiều ảnh -->
              <div class="pm-left">
                <div id="pmImagePreview"></div>
                <input type="file" id="pmImages" multiple />
              </div>

              <!-- RIGHT: bảng nhập thông tin sản phẩm -->
              <div class="pm-right">
                <table class="pm-table">
                  <tr><td>ID sản phẩm</td><td><input id="pmId"></td></tr>
                  <tr><td>Tên</td><td><input id="pmName"></td></tr>
                  <tr><td>Giá</td><td><input id="pmPrice" type="number"></td></tr>
                  <tr><td>Số lượng</td><td><input id="pmQuantity" type="number"></td></tr>
                  <tr><td>CPU</td><td><input id="pmCPU"></td></tr>
                  <tr><td>Card đồ họa</td><td><input id="pmGPU"></td></tr>
                  <tr><td>RAM</td><td><input id="pmRAM"></td></tr>
                  <tr><td>Ổ cứng</td><td><input id="pmStorage"></td></tr>
                  <tr><td>Kích thước</td><td><input id="pmSize"></td></tr>
                  <tr><td>Công nghệ màn hình</td><td><input id="pmScreenTech"></td></tr>
                  <tr><td>Độ phân giải</td><td><input id="pmResolution"></td></tr>
                  <tr><td>Pin</td><td><input id="pmBattery"></td></tr>
                  <tr><td>Hệ điều hành</td><td><input id="pmOS"></td></tr>
                  <tr><td>Cổng giao tiếp</td><td><input id="pmPorts"></td></tr>
                </table>
              </div>
            </div>

            <!-- Footer modal -->
            <div class="pm-footer">
              <button class="pm-cancel">Hủy</button>
              <button id="pmSave">Lưu</button>
            </div>

          </div>
        </div>
        <!-- ========== END MODAL ========== -->

        <!-- TABLE LIST -->
        <table id="productTable">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>CPU</th>
              <th>GPU</th>
              <th>Giá</th>
              <th>Số lượng</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>

      </div>
    </div>
    `;

    /* ======================================================
       2. DATA & STATE
       ====================================================== */

    // Mảng sản phẩm (đóng vai trò như database tạm)
    let products = [];

    // Lưu trạng thái modal:
    // null  -> Add
    // number -> Edit (index trong mảng)
    let editingIndex = null;

    /* ======================================================
       3. CACHE DOM ELEMENTS
       ====================================================== */

    const tbody = this.querySelector("#productTable tbody");
    const searchInput = this.querySelector("#searchInput");
    const pmModal = this.querySelector("#pmModal");
    const pmTitle = this.querySelector("#pmTitle");
    const pmImages = this.querySelector("#pmImages");
    const pmImagePreview = this.querySelector("#pmImagePreview");

    // Hàm rút gọn để lấy value input
    const val = id => this.querySelector(id).value;

    /* ======================================================
       4. MODAL HELPERS
       ====================================================== */

    // Reset modal khi thêm mới
    const resetModal = () => {
      editingIndex = null;
      pmTitle.textContent = "Thêm sản phẩm";
      pmImages.value = "";
      pmImagePreview.innerHTML = "";
      this.querySelectorAll(".pm-right input").forEach(i => i.value = "");
    };

    // Đổ dữ liệu vào modal khi chỉnh sửa
    const fillModal = p => {
      pmTitle.textContent = "Chỉnh sửa sản phẩm";
      this.querySelector("#pmId").value = p.id;
      this.querySelector("#pmName").value = p.name;
      this.querySelector("#pmPrice").value = p.price;
      this.querySelector("#pmQuantity").value = p.quantity;
      this.querySelector("#pmCPU").value = p.cpu;
      this.querySelector("#pmGPU").value = p.gpu;
      this.querySelector("#pmRAM").value = p.ram;
      this.querySelector("#pmStorage").value = p.storage;
      this.querySelector("#pmSize").value = p.size;
      this.querySelector("#pmScreenTech").value = p.screenTech;
      this.querySelector("#pmResolution").value = p.resolution;
      this.querySelector("#pmBattery").value = p.battery;
      this.querySelector("#pmOS").value = p.os;
      this.querySelector("#pmPorts").value = p.ports;
      pmImagePreview.innerHTML =
        p.images.map(img => `<img src="${img}">`).join("");
    };

    /* ======================================================
       5. RENDER TABLE
       ====================================================== */
    const renderTable = (list = products) => {
      tbody.innerHTML = "";
      list.forEach((p, i) => {
        tbody.innerHTML += `
          <tr>
            <td>${p.id}</td>
            <td>${p.name}</td>
            <td>${p.cpu}</td>
            <td>${p.gpu}</td>
            <td>$${p.price}</td>
            <td>${p.quantity}</td>
            <td class="actions">
              <i class="edit" data-i="${i}">✏️</i>
              <i class="delete" data-i="${i}">🗑</i>
            </td>
          </tr>
        `;
      });
      attachRowEvents();
    };

    /* ======================================================
       6. TABLE ROW EVENTS
       ====================================================== */
    const attachRowEvents = () => {

      // Edit → mở modal & fill dữ liệu
      this.querySelectorAll(".edit").forEach(btn => {
        btn.onclick = () => {
          editingIndex = btn.dataset.i;
          fillModal(products[editingIndex]);
          pmModal.style.display = "flex";
        };
      });

      // Delete → xóa sản phẩm
      this.querySelectorAll(".delete").forEach(btn => {
        btn.onclick = () => {
          products.splice(btn.dataset.i, 1);
          renderTable();
        };
      });
    };

    /* ======================================================
       7. SEARCH (lọc realtime)
       ====================================================== */
    searchInput.oninput = () => {
      const q = searchInput.value.toLowerCase();
      renderTable(products.filter(p =>
        p.id.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.cpu.toLowerCase().includes(q) ||
        p.gpu.toLowerCase().includes(q)
      ));
    };

    /* ======================================================
       8. MODAL EVENTS
       ====================================================== */

    // Mở modal Add
    this.querySelector("#addProductBtn").onclick = () => {
      resetModal();
      pmModal.style.display = "flex";
    };

    // Đóng modal
    this.querySelector(".pm-close").onclick =
    this.querySelector(".pm-cancel").onclick = () => {
      pmModal.style.display = "none";
    };

    // Upload & preview nhiều ảnh
    pmImages.onchange = e => {
      pmImagePreview.innerHTML = "";
      [...e.target.files].forEach(f => {
        const url = URL.createObjectURL(f);
        pmImagePreview.innerHTML += `<img src="${url}">`;
      });
    };

    // Save → Add hoặc Edit
    this.querySelector("#pmSave").onclick = () => {

      const data = {
        id: val("#pmId"),
        name: val("#pmName"),
        price: Number(val("#pmPrice")),
        quantity: Number(val("#pmQuantity")),
        cpu: val("#pmCPU"),
        gpu: val("#pmGPU"),
        ram: val("#pmRAM"),
        storage: val("#pmStorage"),
        size: val("#pmSize"),
        screenTech: val("#pmScreenTech"),
        resolution: val("#pmResolution"),
        battery: val("#pmBattery"),
        os: val("#pmOS"),
        ports: val("#pmPorts"),
        images: [...pmImagePreview.querySelectorAll("img")].map(i => i.src)
      };

      if (editingIndex === null) products.push(data);
      else products[editingIndex] = data;

      pmModal.style.display = "none";
      renderTable();
    };

    /* ======================================================
       9. INIT
       ====================================================== */
    renderTable();
  }
}

customElements.define("product-content", productcontent);
