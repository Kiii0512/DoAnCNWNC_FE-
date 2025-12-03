class MockCharts extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <style>
        .charts {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          padding: 20px;
        }
        .chart-card {
          background: #fff;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        }
        .chart-card h3 {
          margin-bottom: 10px;
          font-size: 18px;
          font-weight: 600;
        }
      </style>

      <div class="charts">
        <div class="chart-card">
          <h3>Doanh thu theo tháng</h3>
          <canvas class="revChart"></canvas>
        </div>

        <div class="chart-card">
          <h3>Sản phẩm bán chạy</h3>
          <canvas class="topChart"></canvas>
        </div>
      </div>
    `;

    this.renderCharts();
  }

  renderCharts() {
    // Lấy canvas trong component
    const revCanvas = this.querySelector(".revChart");
    const topCanvas = this.querySelector(".topChart");
    // Revenue Chart
    new Chart(revCanvas, {
      type: "line",
      data: {
        labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul"],
        datasets: [{
          label: "Doanh thu ($)",
          data: [20000,25000,18000,30000,40000,35000,50000],
          borderWidth: 3,
          borderColor: "#0d6efd",
          fill: false
        }]
      }
    });

    // Top Products Chart
    new Chart(topCanvas, {
      type: "bar",
      data: {
        labels: ["iPhone 15", "iPad Air", "MacBook Air", "AirPods Pro"],
        datasets: [{
          label: "Số lượng bán",
          data: [120, 80, 65, 40],
          backgroundColor: ["#0d6efd","#3d8bfd","#6ea8fe","#9ec5fe"]
        }]
      }
    });
  }
}

customElements.define("mock-charts", MockCharts);
