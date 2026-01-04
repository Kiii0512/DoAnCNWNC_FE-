const API_BASE_URL = "https://localhost:7155/api/auth";

/**
 * Gửi yêu cầu quên mật khẩu - gửi OTP về email
 * @param {string} email - Email của tài khoản
 * @returns {Promise<object>} - Phản hồi từ API
 */
export async function forgotPassword(email) {
    try {
        const response = await fetch(`${API_BASE_URL}/forgot-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: email })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Không thể gửi yêu cầu quên mật khẩu");
        }

        return data;
    } catch (error) {
        console.error("Forgot password error:", error);
        throw error;
    }
}

/**
 * Đặt lại mật khẩu với OTP
 * @param {string} email - Email của tài khoản
 * @param {string} otp - Mã OTP
 * @param {string} newPassword - Mật khẩu mới
 * @returns {Promise<object>} - Phản hồi từ API
 */
export async function resetPassword(email, otp, newPassword) {
    try {
        const response = await fetch(`${API_BASE_URL}/reset-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                otp: otp,
                newPassword: newPassword
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Không thể đặt lại mật khẩu");
        }

        return data;
    } catch (error) {
        console.error("Reset password error:", error);
        throw error;
    }
}

