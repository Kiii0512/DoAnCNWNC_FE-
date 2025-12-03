class KPI extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <!-- KPI SECTION -->
        <div class="kpi-grid">
            <div class="kpi-box">
                <h4>Doanh thu hôm nay</h4>
                <div class="value">$3,250</div>
                <i class="fa fa-dollar-sign"></i>
            </div>

            <div class="kpi-box">
                <h4>Đơn hàng hôm nay</h4>
                <div class="value">82</div>
                <i class="fa fa-shopping-bag"></i>
            </div>

            <div class="kpi-box">
                <h4>Khách hàng mới</h4>
                <div class="value">25</div>
                <i class="fa fa-user-plus"></i>
            </div>

            <div class="kpi-box">
                <h4>Top sản phẩm</h4>
                <div class="value">iPhone 15 Pro</div>
                <i class="fa fa-mobile"></i>
            </div>
        </div>

      `;
    }
}
customElements.define("kpi-section", KPI);
