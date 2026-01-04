import { registerAccount, validatePassword, validatePhone, validateEmail, getPasswordValidationMessage, getPhoneValidationMessage, getEmailValidationMessage } from '../API/registerApi.js';
import { forgotPassword, resetPassword } from '../API/forgotPasswordApi.js';

const container = document.querySelector('.container');
const registerForm = document.getElementById('registerForm');

// State for forgot password flow
let forgotPasswordEmail = '';

// ====== ĐỌC MODE TỪ URL =====
const params = new URLSearchParams(window.location.search);
const mode = params.get("mode");

if (mode === "register") {
    container.classList.add('active');
} else {
    container.classList.remove('active');
}

// ====== TOGGLE GIỮA ĐĂNG NHẬP VÀ ĐĂNG KÝ =====
const showRegisterBtn = document.getElementById('showRegister');
const showLoginBtn = document.getElementById('showLogin');

if (showRegisterBtn) {
    showRegisterBtn.addEventListener('click', () => {
        container.classList.add('active');
        history.replaceState(null, "", "?mode=register");
    });
}

if (showLoginBtn) {
    showLoginBtn.addEventListener('click', () => {
        container.classList.remove('active');
        history.replaceState(null, "", "?mode=login");
    });
}

// ====== FORGOT PASSWORD FUNCTIONALITY =====
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const otpResetForm = document.getElementById('otpResetForm');
const backToLoginFromForgot = document.getElementById('backToLoginFromForgot');
const backToLoginFromOTP = document.getElementById('backToLoginFromOTP');

// Show forgot password form
forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    container.classList.add('forgot-mode');
});

// Back to login from forgot password form
backToLoginFromForgot.addEventListener('click', (e) => {
    e.preventDefault();
    resetToLogin();
});

// Back to login from OTP form
backToLoginFromOTP.addEventListener('click', (e) => {
    e.preventDefault();
    resetToLogin();
});

// Reset to login state
function resetToLogin() {
    container.classList.remove('active');
    container.classList.remove('forgot-mode');
    container.classList.remove('otp-mode');
    
    // Clear forms
    forgotPasswordForm?.reset();
    otpResetForm?.reset();
    clearErrorMessages();
}

// Handle forgot password form submission
if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('forgotEmail').value.trim();
        clearErrorMessages();
        
        // Validate email format
        if (!validateEmail(email)) {
            showError('forgotEmail', 'Vui lòng nhập đúng định dạng email');
            return;
        }
        
        try {
            const submitBtn = forgotPasswordForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Đang gửi...';
            
            // Call forgot password API
            const response = await forgotPassword(email);
            
            console.log("Forgot password response:", response);
            
            // Store email for next step
            forgotPasswordEmail = email;
            
            // Show success message
            alert('Mã OTP đã được gửi về email của bạn!');
            
            // Switch to OTP form
            container.classList.remove('forgot-mode');
            container.classList.add('otp-mode');
            
            // Update instructions with email
            const otpInstructions = document.getElementById('otpInstructions');
            if (otpInstructions) {
                otpInstructions.textContent = `Mã OTP đã được gửi về: ${email}`;
            }
            
            // Focus on OTP input
            setTimeout(() => {
                document.getElementById('otpCode')?.focus();
            }, 300);
            
        } catch (error) {
            console.error("Forgot password error:", error);
            alert(error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            const submitBtn = forgotPasswordForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Gửi OTP';
            }
        }
    });
    
    // Real-time validation for email
    const forgotEmail = document.getElementById('forgotEmail');
    if (forgotEmail) {
        forgotEmail.addEventListener('blur', () => {
            const email = forgotEmail.value.trim();
            if (email && !validateEmail(email)) {
                showError('forgotEmail', 'Vui lòng nhập đúng định dạng email');
            } else {
                clearError('forgotEmail');
            }
        });
    }
}

// Handle OTP reset form submission
if (otpResetForm) {
    otpResetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const otp = document.getElementById('otpCode').value.trim();
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;
        
        clearErrorMessages();
        
        let isValid = true;
        
        // Validate OTP
        if (!otp || otp.length < 4) {
            showError('otpCode', 'Mã OTP phải có ít nhất 4 ký tự');
            isValid = false;
        }
        
        // Validate new password
        if (!validatePassword(newPassword)) {
            showError('newPassword', getPasswordValidationMessage());
            isValid = false;
        }
        
        // Validate confirm password
        if (newPassword !== confirmNewPassword) {
            showError('confirmNewPassword', 'Mật khẩu xác nhận không khớp');
            isValid = false;
        }
        
        if (!isValid) {
            return;
        }
        
        try {
            const submitBtn = otpResetForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Đang xử lý...';
            
            // Call reset password API
            const response = await resetPassword(forgotPasswordEmail, otp, newPassword);
            
            console.log("Reset password response:", response);
            
            // Show success message
            alert('Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.');
            
            // Reset to login
            resetToLogin();
            
        } catch (error) {
            console.error("Reset password error:", error);
            alert(error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            const submitBtn = otpResetForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Đặt lại mật khẩu';
            }
        }
    });
    
    // Real-time validation for OTP
    const otpCode = document.getElementById('otpCode');
    if (otpCode) {
        otpCode.addEventListener('blur', () => {
            const otp = otpCode.value.trim();
            if (otp && otp.length < 4) {
                showError('otpCode', 'Mã OTP phải có ít nhất 4 ký tự');
            } else {
                clearError('otpCode');
            }
        });
    }
    
    // Real-time validation for new password
    const newPassword = document.getElementById('newPassword');
    if (newPassword) {
        newPassword.addEventListener('blur', () => {
            const password = newPassword.value;
            if (password && !validatePassword(password)) {
                showError('newPassword', getPasswordValidationMessage());
            } else {
                clearError('newPassword');
            }
        });
    }
    
    // Real-time validation for confirm password
    const confirmNewPassword = document.getElementById('confirmNewPassword');
    if (confirmNewPassword) {
        confirmNewPassword.addEventListener('blur', () => {
            const password = document.getElementById('newPassword').value;
            const confirmPassword = confirmNewPassword.value;
            if (confirmPassword && password !== confirmPassword) {
                showError('confirmNewPassword', 'Mật khẩu xác nhận không khớp');
            } else {
                clearError('confirmNewPassword');
            }
        });
    }
}

// ====== REGISTER FORM HANDLING =====
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const phone = document.getElementById('regPhone').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        
        // Clear previous error messages
        clearErrorMessages();
        
        let isValid = true;
        
        // Validate phone format
        if (!validatePhone(phone)) {
            showError('regPhone', getPhoneValidationMessage());
            isValid = false;
        }
        
        // Validate email format
        if (!validateEmail(email)) {
            showError('regEmail', getEmailValidationMessage());
            isValid = false;
        }
        
        // Validate password format
        if (!validatePassword(password)) {
            showError('regPassword', getPasswordValidationMessage());
            isValid = false;
        }
        
        // Validate password match
        if (password !== confirmPassword) {
            showError('regConfirmPassword', 'Mật khẩu xác nhận không khớp');
            isValid = false;
        }
        
        if (!isValid) {
            return;
        }
        
        try {
            // Disable submit button during API call
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Đang đăng ký...';
            
            // Step 1: Register the account with email
            const response = await registerAccount(phone, email, password, 0); // 0 = Customer role
            
            console.log("Register successful:", response);
            
            // Step 2: Automatically login after successful registration
            submitBtn.textContent = 'Đang đăng nhập...';
            
            const loginResponse = await fetch("https://localhost:7155/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    phone: phone,
                    password: password
                })
            });

            if (!loginResponse.ok) {
                throw new Error("Đăng ký thành công nhưng đăng nhập thất bại. Vui lòng đăng nhập thủ công.");
            }

            const loginData = await loginResponse.json();
            const data = loginData.data || loginData;
            const accessToken = data.accessToken || data.access_token || data.token;
            
            // Store login data
            localStorage.setItem("accesstoken", accessToken);
            localStorage.setItem("accountId", data.accountId || data.id || data.userId || "");
            localStorage.setItem("username", data.name || data.userName || data.username || phone);
            localStorage.setItem("role", data.role || data.roles || "user");
            
            // Dispatch auth changed event to update UI
            window.dispatchEvent(new Event("authChanged"));
            
            // Store phone and email for pre-fill on userInfo page
            localStorage.setItem("pendingPhone", phone);
            localStorage.setItem("pendingEmail", email);
            localStorage.setItem("justRegistered", "true");
            
            alert('Đăng ký thành công! Vui lòng hoàn thiện thông tin cá nhân.');
            
            // Clear form
            registerForm.reset();
            
            // Navigate to userInfoPage.html to complete customer info
            window.location.href = "userInfoPage.html";
            
        } catch (error) {
            console.error("Register/Login error:", error);
            alert(error.message);
        } finally {
            // Re-enable submit button
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Đăng ký';
        }
    });
    
    // Real-time validation for phone
    const regPhone = document.getElementById('regPhone');
    if (regPhone) {
        regPhone.addEventListener('blur', () => {
            const phone = regPhone.value.trim();
            if (phone && !validatePhone(phone)) {
                showError('regPhone', getPhoneValidationMessage());
            } else {
                clearError('regPhone');
            }
        });
    }
    
    // Real-time validation for email
    const regEmail = document.getElementById('regEmail');
    if (regEmail) {
        regEmail.addEventListener('blur', () => {
            const email = regEmail.value.trim();
            if (email && !validateEmail(email)) {
                showError('regEmail', getEmailValidationMessage());
            } else {
                clearError('regEmail');
            }
        });
    }
    
    // Real-time validation for password
    const regPassword = document.getElementById('regPassword');
    if (regPassword) {
        regPassword.addEventListener('blur', () => {
            const password = regPassword.value;
            if (password && !validatePassword(password)) {
                showError('regPassword', getPasswordValidationMessage());
            } else {
                clearError('regPassword');
            }
        });
    }
    
    // Real-time validation for confirm password
    const regConfirmPassword = document.getElementById('regConfirmPassword');
    if (regConfirmPassword) {
        regConfirmPassword.addEventListener('blur', () => {
            const password = document.getElementById('regPassword').value;
            const confirmPassword = regConfirmPassword.value;
            if (confirmPassword && password !== confirmPassword) {
                showError('regConfirmPassword', 'Mật khẩu xác nhận không khớp');
            } else {
                clearError('regConfirmPassword');
            }
        });
    }
}

// Helper function to show error message
function showError(inputId, message) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    // Remove previous error if exists
    clearError(inputId);
    
    // Add error class to input
    input.classList.add('error-input');
    
    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.id = `error-${inputId}`;
    errorDiv.textContent = message;
    
    // Insert error message after the input box
    const inputBox = input.closest('.input-box');
    if (inputBox) {
        inputBox.appendChild(errorDiv);
    }
}

// Helper function to clear error message
function clearError(inputId) {
    const errorDiv = document.getElementById(`error-${inputId}`);
    if (errorDiv) {
        errorDiv.remove();
    }
    
    const input = document.getElementById(inputId);
    if (input) {
        input.classList.remove('error-input');
    }
}

// Helper function to clear all error messages
function clearErrorMessages() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(el => el.remove());
    
    const errorInputs = document.querySelectorAll('.error-input');
    errorInputs.forEach(el => el.classList.remove('error-input'));
}

