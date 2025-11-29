// ===============================
// BANNER SLIDER
// ===============================

// Khởi tạo biến
let slideIndex = 0;
const slides = document.querySelectorAll(".slide"); // tất cả slide
const dots = document.querySelectorAll(".dot");     // các dot
const prev = document.querySelector(".prev");       // nút prev
const next = document.querySelector(".next");       // nút next

// Hiển thị slide theo index
function showSlide(index) {
  if (index >= slides.length) slideIndex = 0;       // nếu vượt max index
  if (index < 0) slideIndex = slides.length - 1;   // nếu bé hơn 0

  slides.forEach((slide, i) => {
    slide.style.display = i === slideIndex ? "block" : "none"; // chỉ hiện slide hiện tại
    dots[i].classList.toggle("active", i === slideIndex);      // cập nhật active dot
  });
}

// Chuyển sang slide kế tiếp
function nextSlide() { slideIndex++; showSlide(slideIndex); }

// Chuyển sang slide trước
function prevSlideFunc() { slideIndex--; showSlide(slideIndex); }

// Gắn sự kiện cho prev/next
next.addEventListener("click", nextSlide);
prev.addEventListener("click", prevSlideFunc);

// Gắn sự kiện cho dot
dots.forEach((dot, i) => dot.addEventListener("click", () => {
  slideIndex = i; showSlide(slideIndex);
}));

// Auto slide mỗi 4 giây
setInterval(() => { slideIndex++; showSlide(slideIndex); }, 4000);

// Hiển thị slide đầu tiên
showSlide(slideIndex);
