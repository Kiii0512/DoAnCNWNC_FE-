import { getCustomerInfo, updateCustomerInfo, changePassword } from "../API/customerApi.js";

// DOM Elements
const userInfoForm = document.getElementById("userInfoForm");
const changePasswordForm = document.getElementById("changePasswordForm");
const toast = document.getElementById("toast");
const btnCancel = document.getElementById("btnCancel");

// Store original data for cancel button
let originalData = {};

// Initialize page
document.addEventListener("DOMContentLoaded", async () => {
  await loadCustomerInfo();
  initEventListeners();
});

// Load customer information
async function loadCustomerInfo() {
  const accountId = localStorage.getItem("username");

  if (!accountId) {
    showToast("Vui lòng đăng nhập để xem thông tin", "error");
    setTimeout(() => {
      window.location.href = "logIn.html?mode=login";
    }, 2000);
    return;
  }

  try {
    const customer = await getCustomerInfo(accountId);

    // Fill form with customer data
    document.getElementById("customerId").value = customer.customerId || "";
    document.getElementById("accountId").value = customer.accountId || accountId;
    document.getElementById("customerName").value = customer.customerName || "";
    document.getElementById("customerEmail").value = customer.customerEmail || "";
    document.getElementById("customerPhone").value = customer.customerPhone || "";
    document.getElementById("customerAddress").value = customer.customerAddress || "";

    // Format date for input
    if (customer.customerDOB) {
      const dob = new Date(customer.customerDOB);
      const formattedDate = dob.toISOString().split("T")[0];
      document.getElementById("customerDOB").value = formattedDate;
    }

    // Store original data for cancel
    originalData = {
      customerId: customer.customerId,
      customerName: customer.customerName,
      customerEmail: customer.customerEmail,
      customerPhone: customer.customerPhone,
      customerAddress: customer.customerAddress,
      customerDOB: customer.customerDOB,
    };
  } catch (error) {
    showToast("Không thể tải thông tin khách hàng", "error");
    console.error("Error loading customer info:", error);
  }
}

// Initialize event listeners
function initEventListeners() {
  // User info form submission
  userInfoForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    await saveCustomerInfo();
  });

  // Cancel button - reset to original data
  btnCancel.addEventListener("click", () => {
    resetFormToOriginal();
  });

  // Change password form submission
  changePasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    await updatePassword();
  });

  // Toggle password visibility
  document.querySelectorAll(".toggle-password").forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.getAttribute("data-target");
      const input = document.getElementById(targetId);
      const icon = button.querySelector("i");

      if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("bxs-hide");
        icon.classList.add("bxs-show");
      } else {
        input.type = "password";
        icon.classList.remove("bxs-show");
        icon.classList.add("bxs-hide");
      }
    });
  });
}

// Save customer information
async function saveCustomerInfo() {
  const customerData = {
    customerId: document.getElementById("customerId").value,
    customerName: document.getElementById("customerName").value.trim(),
    customerEmail: document.getElementById("customerEmail").value.trim(),
    customerPhone: document.getElementById("customerPhone").value.trim(),
    customerAddress: document.getElementById("customerAddress").value.trim(),
    customerDOB: document.getElementById("customerDOB").value || null,
  };

  // Validate required fields
  if (
    !customerData.customerName ||
    !customerData.customerEmail ||
    !customerData.customerPhone ||
    !customerData.customerAddress
  ) {
    showToast("Vui lòng điền đầy đủ thông tin bắt buộc", "error");
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customerData.customerEmail)) {
    showToast("Email không hợp lệ", "error");
    return;
  }

  // Validate phone format (Vietnamese phone)
  const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
  if (!phoneRegex.test(customerData.customerPhone)) {
    showToast("Số điện thoại không hợp lệ", "error");
    return;
  }

  try {
    await updateCustomerInfo(customerData);
    showToast("Cập nhật thông tin thành công!", "success");

    // Update original data
    originalData = { ...customerData };
  } catch (error) {
    showToast("Cập nhật thông tin thất bại", "error");
    console.error("Error updating customer info:", error);
  }
}

// Reset form to original data
function resetFormToOriginal() {
  document.getElementById("customerName").value = originalData.customerName || "";
  document.getElementById("customerEmail").value = originalData.customerEmail || "";
  document.getElementById("customerPhone").value = originalData.customerPhone || "";
  document.getElementById("customerAddress").value = originalData.customerAddress || "";

  if (originalData.customerDOB) {
    const dob = new Date(originalData.customerDOB);
    const formattedDate = dob.toISOString().split("T")[0];
    document.getElementById("customerDOB").value = formattedDate;
  } else {
    document.getElementById("customerDOB").value = "";
  }

  showToast("Đã khôi phục dữ liệu gốc", "info");
}

// Update password
async function updatePassword() {
  const currentPassword = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  // Validate passwords
  if (!currentPassword || !newPassword || !confirmPassword) {
    showToast("Vui lòng điền đầy đủ thông tin mật khẩu", "error");
    return;
  }

  if (newPassword !== confirmPassword) {
    showToast("Mật khẩu mới không khớp", "error");
    return;
  }

  // Validate password strength
  if (newPassword.length < 6) {
    showToast("Mật khẩu mới phải có ít nhất 6 ký tự", "error");
    return;
  }

  try {
    await changePassword(currentPassword, newPassword);
    showToast("Đổi mật khẩu thành công!", "success");

    // Clear form
    changePasswordForm.reset();
  } catch (error) {
    showToast(error.message || "Đổi mật khẩu thất bại", "error");
    console.error("Error changing password:", error);
  }
}

// Show toast notification
function showToast(message, type = "info") {
  toast.textContent = message;
  toast.className = `toast ${type} show`;

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

