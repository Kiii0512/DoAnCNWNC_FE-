import { registerAccount, validatePassword, validatePhone, getPasswordValidationMessage, getPhoneValidationMessage } from '../API/registerApi.js';

const container = document.querySelector('.container'); 
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');
const registerForm = document.getElementById('registerForm');

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

// ====== REGISTER FORM HANDLING ======
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const phone = document.getElementById('regPhone').value.trim();
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
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Đang đăng ký...';
            
            // Step 1: Register the account
            const response = await registerAccount(phone, password, 0); // 0 = Customer role
            
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
            
            // Store phone for pre-fill on userInfo page - use the phone from registration form
            // This is critical for ensuring phone is pre-filled on userInfo page
            localStorage.setItem("pendingPhone", phone);
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
