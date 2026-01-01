class bannerSlider extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section class="banner">
        <div class="slides">
          <div class="slide"><img src="https://shopdunk.com/images/uploaded/banner/Banner%202025/Tha%CC%81ng%2010/banner%20iP17-%C4%90C_Danh%20m%E1%BB%A5c.png"></div>
          <div class="slide"><img src="https://shopdunk.com/images/uploaded/banner/Banner%202025/Tha%CC%81ng%2010/thang%2010%20_3/danh%20m%E1%BB%A5c-ip_Danh%20m%E1%BB%A5c.png"></div>
          <div class="slide"><img src="https://shopdunk.com/images/uploaded/15.%20camera%20iPhone%2015/banner%20iP17pro-%C4%90C2_Danh%20m%E1%BB%A5c.png"></div>
        </div>

        <button class="prev">&#10094;</button>
        <button class="next">&#10095;</button>

        <div class="dots">
          <span class="dot active"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </section>
    `;

    this.index = 0;
    this.slides = this.querySelector(".slides");
    this.items = this.querySelectorAll(".slide");
    this.dots = this.querySelectorAll(".dot");
    this.total = this.items.length;

    this.querySelector(".next").onclick = () => this.move(1);
    this.querySelector(".prev").onclick = () => this.move(-1);

    this.dots.forEach((dot, i) => {
      dot.onclick = () => this.goTo(i);
    });

    this.auto = setInterval(() => this.move(1), 4000);
    this.update();
  }

  move(step) {
    this.index = (this.index + step + this.total) % this.total;
    this.update();
  }

  goTo(i) {
    this.index = i;
    this.update();
  }

  update() {
    this.slides.style.transform = `translateX(-${this.index * 100}%)`;
    this.dots.forEach((d, i) =>
      d.classList.toggle("active", i === this.index)
    );
  }
}

customElements.define("banner-slider", bannerSlider);