class SideBar extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <div class="sidebar">
            <ul class="side-menu">
                <li><a href="#" class="active">Dashboard</a></li>
                <li><a href="#">Orders</a></li>
                <li><a href="#">Products</a></li>
                <li><a href="#">Customers</a></li>
                <li><a href="#">Vendors</a></li>
                <li><a href="#">History</a></li>
                <li><a href="#">Messages</a></li>
                <li><a href="#">Settings</a></li>
                <li><a href="#">Logout</a></li>
            </ul>
        </div>
      `;
    }
}
customElements.define("side-bar", SideBar);
