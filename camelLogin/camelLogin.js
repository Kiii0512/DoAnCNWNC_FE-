// ===============================
//  HANDLE LOGIN FORM
// ===============================
const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

registerBtn.addEventListener('click', () => {
    container.classList.add('active');
})

loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
})

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault(); // Ngăn load lại trang

    // Lấy dữ liệu từ các input có sẵn
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    // Gói dữ liệu gửi API
    const payload = {
        username: username,
        password: password
    };

    try {
        // Gọi API Login
        const response = await fetch("https://localhost:7145/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Login failed!");
            return;
        }

        alert("Login successful!");

        // Nếu API trả về token thì lưu:
        // localStorage.setItem("token", data.token);

        console.log("Login success:", data);

    } catch (error) {
        console.error(error);
        alert("Cannot connect to API!");
    }
});


// ===============================
//  HANDLE REGISTER FORM
// ===============================

document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    // Lấy dữ liệu
    const username = document.getElementById("reg-username").value;
    const phone = document.getElementById("reg-phone").value;
    const password = document.getElementById("reg-password").value;
    const confirmPassword = document.getElementById("reg-cfpassword").value;

    // Lấy giới tính từ radio (không thêm input mới)
    const gender = document.querySelector("input[name='gender']:checked")?.value;

    // Kiểm tra password trùng khớp
    if (password !== confirmPassword) {
        alert("Confirm password does not match!");
        return;
    }

    // Gói dữ liệu đúng như API ASP.NET cần
    const payload = {
        username: username,
        phone: phone,
        gender: gender,
        password: password
    };

    try {
        // Gọi API Register
        const response = await fetch("https://localhost:7145/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Register failed!");
            return;
        }

        alert("Register success!");

        console.log("Register success:", data);

    } catch (error) {
        console.error(error);
        alert("Cannot connect to API!");
    }
});

