// ==========================
// Toggle Login / Register UI
// ==========================
const loginBtn = document.querySelector(".login-btn");
const registerBtn = document.querySelector(".register-btn");
const container = document.querySelector(".container");

registerBtn.addEventListener("click", () => {
  container.classList.add("active");
});

loginBtn.addEventListener("click", () => {
  container.classList.remove("active");
});

// ================
// API CONFIG
// ================
const API_LOGIN = "https://localhost:7155/api/Auth/login";
const API_REGISTER = "https://localhost:7155/api/Auth/register";

// ============================
// LOGIN FORM SUBMIT
// ============================
const loginForm = document.querySelector(".form-box.login form");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const phone = loginForm.querySelector("input[type=text]").value;
  const password = loginForm.querySelector("input[type=password]").value;

  const body = {
    phone: phone,
    password: password
  };

  try {
    const res = await fetch(API_LOGIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const error = await res.json();
      alert("Login failed: " + JSON.stringify(error));
      return;
    }

    const data = await res.json();
    alert("Login successful!");

    // Lưu token
    localStorage.setItem("access_token", data.token);

    // Redirect
    window.location.href = "home.html";

  } catch (err) {
    console.error(err);
    alert("Error connecting to server!");
  }
});

// ============================
// REGISTER FORM SUBMIT
// ============================
const registerForm = document.querySelector(".form-box.register form");

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = registerForm.querySelector("input[placeholder='Username']").value;
  const phone = registerForm.querySelector("input[placeholder='Number Phone']").value;
  const password = registerForm.querySelector("input[placeholder='Password']").value;
  const cfpassword = registerForm.querySelector("input[placeholder='Confirm Password']").value;

  if (password !== cfpassword) {
    alert("Passwords do not match!");
    return;
  }

  const body = {
    phone: phone,
    password: password,
    role: "Customer"  // enum declare in your backend
  };

  try {
    const res = await fetch(API_REGISTER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const error = await res.json();
      alert("Register failed: " + JSON.stringify(error));
      return;
    }

    alert("Register successful! Please login.");
    container.classList.remove("active");

  } catch (err) {
    console.error(err);
    alert("Error connecting to server!");
  }
});
