class SideBar extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
    <div class="sidebar">
        <h3>MENU</h3>
        <a class="active" href="admin.html"><i class="fa fa-chart-line"></i> Dashboard</a>
        <a href="#"><i class="fa fa-box"></i> Sản phẩm</a>
        <a href="#"><i class="fa fa-shopping-cart"></i> Đơn hàng</a>
        <a href="#"><i class="fa fa-users"></i> Khách hàng</a>
        <a href="#"><i class="fa fa-gear"></i> Cài đặt</a>
    </div>
      `;
    }
}
customElements.define("side-bar", SideBar);
