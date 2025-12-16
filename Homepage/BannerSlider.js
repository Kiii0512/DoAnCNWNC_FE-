class BannerSlider extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <style>
        .banner {
        position: relative;
        width: 100%;
        height: 500px;
        overflow: hidden;
        margin-top: 80px;
        }

        .banner {
        height: 60vh;
        }

        .slide img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        background-color: #ffffff;
        display: block;
        }

        .slides {
        display: flex;
        transition: transform 0.6s ease;
        height: 100%;
        }

        .prev, .next {
          position: absolute; 
          top:50%; 
          transform: translateY(-50%);
          background: rgba(0,0,0,0.5); 
          color:white; 
          border:none; 
          font-size:30px;
          cursor:pointer; 
          padding:8px 12px; 
          border-radius:50%;
        }
        .prev {
        left: 15px;
        }

        .next {
        right: 15px;
        }

        .prev:hover,
        .next:hover {
        background: rgba(0, 0, 0, 0.7);
        }

        .dots {
        position: absolute;
        bottom: 20px;
        width: 100%;
        text-align: center;
        }

        .dot {
        height: 12px;
        width: 12px;
        margin: 0 5px;
        background-color: #bbb;
        border-radius: 50%;
        display: inline-block;
        transition: background-color 0.4s;
        cursor: pointer;
        }

        .dot.active {
        background-color: #0071e3;
        }

      </style>
        <!--chưa tối ưu để lấy từ api-->
      <section class="banner">
        <div class="slides">
          <div class="slide active">
            <img src="https://shopdunk.com/images/uploaded/banner/Banner%202025/Tha%CC%81ng%2010/banner%20iP17-%C4%90C_Danh%20m%E1%BB%A5c.png" alt="iPhone 16 Pro Max">
          </div>
          <div class="slide">
            <img src="https://shopdunk.com/images/uploaded/banner/Banner%202025/Tha%CC%81ng%2010/thang%2010%20_3/danh%20m%E1%BB%A5c-ip_Danh%20m%E1%BB%A5c.png" alt="iPad Pro M4">
          </div>
          <div class="slide">
            <img src="https://shopdunk.com/images/uploaded/15.%20camera%20iPhone%2015/banner%20iP17pro-%C4%90C2_Danh%20m%E1%BB%A5c.png" alt="MacBook Air M3">
          </div>
        </div>

        <!--nút điều hướng-->
        <button class="prev">&#10094;</button>
        <button class="next">&#10095;</button>

        <!--chấm chỉ mục-->
        <div class="dots">
          <span class="dot active"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </section>
    `;

    const script = document.createElement('script');
    script.textContent = `
      // BANNER SLIDER (giữ nguyên)
    let slideIndex = 0;
    const slides = document.querySelectorAll(".slide");
    const dots = document.querySelectorAll(".dot");
    const prev = document.querySelector(".prev");
    const next = document.querySelector(".next");

    function showSlide(index) {
    if (index >= slides.length) slideIndex = 0;
    if (index < 0) slideIndex = slides.length - 1;

    slides.forEach((slide, i) => {
        slide.style.display = i === slideIndex ? "block" : "none";
        dots[i].classList.toggle("active", i === slideIndex);
    });
    }

    function nextSlide() { slideIndex++; showSlide(slideIndex); }
    function prevSlideFunc() { slideIndex--; showSlide(slideIndex); }

    next.addEventListener("click", nextSlide);
    prev.addEventListener("click", prevSlideFunc);
    dots.forEach((dot, i) => dot.addEventListener("click", () => {
    slideIndex = i; showSlide(slideIndex);
    }));

    setInterval(() => { slideIndex++; showSlide(slideIndex); }, 4000);
    showSlide(slideIndex);

    `;
    this.appendChild(script);
  }
}

customElements.define('banner-slider', BannerSlider);
