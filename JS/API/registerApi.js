// API for registration operations
const REGISTER_API_URL = "https://localhost:7155/api/auth/register";

// Password regex: at least 8 chars, uppercase, lowercase, number, special char
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Vietnamese phone regex: 10 digits starting with 0
export const PHONE_REGEX = /^0\d{9}$/;

// Email regex: standard email format
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Register new account
export async function registerAccount(phone, email, password, role = 0) {
  try {
    console.log("Registering account with phone:", phone, "email:", email);
    console.log("API URL:", REGISTER_API_URL);
    
    const response = await fetch(REGISTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        phone: phone,
        email: email,
        password: password,
        confirmPassword: password,
        confirmEmail: email,
        confirmPhone: phone,
        role: role
      })
    });

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      
      let errorMessage = "Đăng ký thất bại";
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // Response is not JSON
        errorMessage = `Lỗi ${response.status}: ${errorText || response.statusText}`;
      }
      
      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    const data = await response.json();
    console.log("Register API response:", data);
    
    // Store accountId, phone and email for customer info completion
    if (data.data && data.data.accountId) {
      localStorage.setItem("pendingAccountId", data.data.accountId);
    } else if (data.accountId) {
      localStorage.setItem("pendingAccountId", data.accountId);
    }
    
    // Store phone and email for pre-fill on userInfo page
    localStorage.setItem("pendingPhone", phone);
    localStorage.setItem("pendingEmail", email);
    
    return data;
  } catch (error) {
    console.error("Register error:", error);
    throw error;
  }
}

// Validate password format
export function validatePassword(password) {
  return PASSWORD_REGEX.test(password);
}

// Validate Vietnamese phone format
export function validatePhone(phone) {
  return PHONE_REGEX.test(phone);
}

// Get password validation message
export function getPasswordValidationMessage() {
  return "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt";
}

// Get phone validation message
export function getPhoneValidationMessage() {
  return "Số điện thoại không hợp lệ (phải là số điện thoại Việt Nam, 10 chữ số bắt đầu bằng 0)";
}

// Validate email format
export function validateEmail(email) {
  return EMAIL_REGEX.test(email);
}

// Get email validation message
export function getEmailValidationMessage() {
  return "Email không hợp lệ (ví dụ: example@domain.com)";
}

