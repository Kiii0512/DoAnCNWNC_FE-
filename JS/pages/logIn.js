const container = document.querySelector('.container'); 
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

// ====== TẮT TRANSITION KHI LOAD ======
container.classList.add('no-transition');

// ====== ĐỌC MODE TỪ URL ======
const params = new URLSearchParams(window.location.search);
const mode = params.get("mode");

if (mode === "register") {
    container.classList.add('active');
} else {
    container.classList.remove('active');
}

// ====== BẬT LẠI TRANSITION SAU 1 FRAME ======
requestAnimationFrame(() => {
    container.classList.remove('no-transition');
});

// ====== TOGGLE TRONG TRANG (CÓ TRANSITION) ======
registerBtn.addEventListener('click', () => {
    container.classList.add('active');
    history.replaceState(null, "", "?mode=register");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
    history.replaceState(null, "", "?mode=login");
});
