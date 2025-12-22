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

    const script = document.createElement('script');
    script.textContent = `
      let slideIndex = 0;
      const slides = document.querySelectorAll(".slide");
      const dots = document.querySelectorAll(".dot");

      function showSlide(index) {
          if (index >= slides.length) slideIndex = 0;
          if (index < 0) slideIndex = slides.length - 1;

          slides.forEach((slide, i) => {
              slide.style.display = (i === slideIndex) ? "block" : "none";
              dots[i].classList.toggle("active", i === slideIndex);
          });
      }

      document.querySelector(".next").onclick = () => { slideIndex++; showSlide(slideIndex); };
      document.querySelector(".prev").onclick = () => { slideIndex--; showSlide(slideIndex); };
      dots.forEach((dot, i) => dot.onclick = () => { slideIndex = i; showSlide(slideIndex); });

      setInterval(() => { slideIndex++; showSlide(slideIndex); }, 4000);
      showSlide(slideIndex);
    `;
    this.appendChild(script);
  }
}
customElements.define("banner-slider", bannerSlider);
