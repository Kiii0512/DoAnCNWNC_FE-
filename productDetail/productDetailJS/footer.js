/* footer component: defines <app-footer> */
class appFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="app-footer">
        <div class="container">
          <div style="min-width:220px">
            <h3>Shop68IT1</h3>
            <p>Địa chỉ: 55 Giải phóng, Hà Nội — Hotline: 1900 1009</p>
          </div>
          <div>
            <h4>Chính sách</h4>
            <p>Đổi trả · Bảo hành · Thanh toán</p>
          </div>
          <div>
            <h4>Theo dõi</h4>
            <p>Facebook · Instagram · YouTube</p>
          </div>
        </div>
      </footer>
    `;
  }
}
customElements.define('app-footer', appFooter);
