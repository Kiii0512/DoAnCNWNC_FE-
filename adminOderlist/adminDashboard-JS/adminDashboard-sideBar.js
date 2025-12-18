class SideBar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
        <div class="sidebar">
            <h2>ADMIN</h2>
            <ul class="side-menu">
                <li><a href="#">Dashboard</a></li>
                <li><a href="#" class="active">Orders</a></li>
                <li><a href="#">Products</a></li>
                <li><a href="#">Customers</a></li>
                <li><a href="#">Account</a></li>
            </ul>
        </div>
      `;
  }
}
customElements.define("side-bar", SideBar);
