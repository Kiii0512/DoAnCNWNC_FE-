import {
  registerAccount,
  validatePassword,
  validatePhone,
  validateEmail,
  getPasswordValidationMessage,
  getPhoneValidationMessage,
  getEmailValidationMessage
} from '../API/registerApi.js';

import { forgotPassword, resetPassword } from '../API/forgotPasswordApi.js';

const container = document.querySelector('.container');
const registerForm = document.getElementById('registerForm');

// ====== STATE ======
let forgotPasswordEmail = '';

// ====== ĐỌC MODE TỪ URL ======
const params = new URLSearchParams(window.location.search);
const mode = params.get("mode");

if (mode === "register") {
  container.classList.add('active');
} else {
  container.classList.remove('active');
}

// ====== TOGGLE LOGIN / REGISTER ======
document.getElementById('showRegister')?.addEventListener('click', () => {
  container.classList.add('active');
  history.replaceState(null, "", "?mode=register");
});

document.getElementById('showLogin')?.addEventListener('click', () => {
  container.classList.remove('active');
  history.replaceState(null, "", "?mode=login");
});

// ====== RESET TO LOGIN ======
function resetToLogin() {
  container.classList.remove('active', 'forgot-mode', 'otp-mode');
  document.getElementById('forgotPasswordForm')?.reset();
  document.getElementById('otpResetForm')?.reset();
  clearErrorMessages();
}

// ====== FORGOT PASSWORD ======
document.getElementById('forgotPasswordLink')?.addEventListener('click', e => {
  e.preventDefault();
  container.classList.add('forgot-mode');
});

document.getElementById('backToLoginFromForgot')?.addEventListener('click', e => {
  e.preventDefault();
  resetToLogin();
});

document.getElementById('backToLoginFromOTP')?.addEventListener('click', e => {
  e.preventDefault();
  resetToLogin();
});

document.getElementById('forgotPasswordForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  clearErrorMessages();

  const email = document.getElementById('forgotEmail').value.trim();
  if (!validateEmail(email)) {
    showError('forgotEmail', 'Vui lòng nhập đúng định dạng email');
    return;
  }

  try {
    await forgotPassword(email);
    forgotPasswordEmail = email;

    alert('Mã OTP đã được gửi về email của bạn!');
    container.classList.remove('forgot-mode');
    container.classList.add('otp-mode');
  } catch (err) {
    alert(err.message || 'Có lỗi xảy ra');
  }
});

document.getElementById('otpResetForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  clearErrorMessages();

  const otp = document.getElementById('otpCode').value.trim();
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmNewPassword').value;

  let valid = true;

  if (!otp || otp.length < 4) {
    showError('otpCode', 'Mã OTP không hợp lệ');
    valid = false;
  }

  if (!validatePassword(newPassword)) {
    showError('newPassword', getPasswordValidationMessage());
    valid = false;
  }

  if (newPassword !== confirmPassword) {
    showError('confirmNewPassword', 'Mật khẩu xác nhận không khớp');
    valid = false;
  }

  if (!valid) return;

  try {
    await resetPassword(forgotPasswordEmail, otp, newPassword);
    alert('Đặt lại mật khẩu thành công!');
    resetToLogin();
  } catch (err) {
    alert(err.message || 'Có lỗi xảy ra');
  }
});

// ====== REGISTER ======
registerForm?.addEventListener('submit', async e => {
  e.preventDefault();
  clearErrorMessages();

  const phone = document.getElementById('regPhone').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirmPassword = document.getElementById('regConfirmPassword').value;

  let valid = true;

  if (!validatePhone(phone)) {
    showError('regPhone', getPhoneValidationMessage());
    valid = false;
  }

  if (!validateEmail(email)) {
    showError('regEmail', getEmailValidationMessage());
    valid = false;
  }

  if (!validatePassword(password)) {
    showError('regPassword', getPasswordValidationMessage());
    valid = false;
  }

  if (password !== confirmPassword) {
    showError('regConfirmPassword', 'Mật khẩu xác nhận không khớp');
    valid = false;
  }

  if (!valid) return;

  try {
    // 1️⃣ Register
    await registerAccount(phone, email, password, 0);

    // 2️⃣ Auto login (cookie-based)
    const loginRes = await fetch("https://localhost:7155/api/auth/login", {
      method: "POST",
      credentials: "include", // 🔥 RẤT QUAN TRỌNG
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password })
    });

    if (!loginRes.ok) {
      throw new Error("Đăng ký thành công nhưng đăng nhập thất bại");
    }

    // ✅ CHỈ LƯU INFO UI
   const loginJson = await loginRes.json();
const loginData = loginJson?.data || loginJson;

localStorage.setItem("username", phone);
localStorage.setItem("role", loginData?.role || "Customer");
localStorage.setItem("justRegistered", "true");
localStorage.setItem("pendingPhone", phone);
localStorage.setItem("pendingEmail", email);

window.dispatchEvent(new Event("authChanged"));

alert("Đăng ký thành công! Vui lòng hoàn thiện thông tin cá nhân.");
registerForm.reset();
window.location.href = "userInfoPage.html";

  } catch (err) {
    alert(err.message || 'Có lỗi xảy ra');
  }
});

// ====== ERROR HELPERS ======
function showError(inputId, message) {
  clearError(inputId);
  const input = document.getElementById(inputId);
  input?.classList.add('error-input');

  const div = document.createElement('div');
  div.className = 'error-message';
  div.id = `error-${inputId}`;
  div.textContent = message;

  input?.closest('.input-box')?.appendChild(div);
}

function clearError(inputId) {
  document.getElementById(`error-${inputId}`)?.remove();
  document.getElementById(inputId)?.classList.remove('error-input');
}

function clearErrorMessages() {
  document.querySelectorAll('.error-message').forEach(e => e.remove());
  document.querySelectorAll('.error-input').forEach(e => e.classList.remove('error-input'));
}