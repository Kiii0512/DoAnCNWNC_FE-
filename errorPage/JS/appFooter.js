class appFooter extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `

        <footer style="justify-content:space-between; background-color: black;">
          <div class="container" style="display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;">
            <div style="min-width:220px">
              <h3 style="color:white;">Shop68IT1</h3>
              <p style="color:white;">Địa chỉ: 55 Giải phóng, Hà Nội — Hotline: 1900 1009</p>
            </div>
            <div>
              <h4 style="color:white;">Chính sách</h4>
              <p style="color:white;">Đổi trả · Bảo hành · Thanh toán</p>
            </div>
            <div>
              <h4 style="color:white;">Theo dõi</h4>
              <p style="color:white;">Facebook · Instagram · YouTube</p>
            </div>
          </div>
        </footer>
      `;
    }
  }
  customElements.define('app-footer', appFooter);