import { getCustomerInfo, updateCustomerInfo, changePassword, createCustomerInfo } from "../API/customerApi.js";

// DOM Elements
const userInfoForm = document.getElementById("userInfoForm");
const changePasswordForm = document.getElementById("changePasswordForm");
const toast = document.getElementById("toast");
const btnCancel = document.getElementById("btnCancel");

// Store original data for cancel button
let originalData = {};

// Check if user just registered
const pendingAccountId = localStorage.getItem("pendingAccountId");
const justRegistered = localStorage.getItem("justRegistered");

// Initialize page
document.addEventListener("DOMContentLoaded", async () => {
  await loadCustomerInfo();
  initEventListeners();
});

// Load customer information
async function loadCustomerInfo() {
  const accountId = localStorage.getItem("accountId");

  console.log("=== LOADING CUSTOMER INFO ===");
  console.log("accountId from localStorage:", accountId);
  console.log("accessToken from localStorage:", localStorage.getItem("accesstoken")?.substring(0, 20) + "...");
  console.log("justRegistered flag:", localStorage.getItem("justRegistered"));

  if (!accountId) {
    console.error("No accountId found in localStorage");
    showToast("Vui lòng đăng nhập để xem thông tin", "error");
    setTimeout(() => {
      window.location.href = "logIn.html?mode=login";
    }, 2000);
    return;
  }

  // Check if user needs to create customer info (new registration or login without customer)
  const isNewUser = localStorage.getItem("justRegistered") === "true";
  
  try {
    console.log("Calling getCustomerInfo with accountId:", accountId);
    const customer = await getCustomerInfo(accountId);

    console.log("API Response - customer object:", customer);
    console.log("API Response - customer type:", typeof customer);

    // Check if customer data exists
    const customerData = customer && (customer.data || customer);
    
    // Check if customerId exists (existing customer) or not (new customer)
    const customerId = customerData && (customerData.customerId || customerData.CustomerId || customerData.id || customerData.Id);
    
    if (!customer || !customerId) {
      // No customer data or no customer ID - new user needs to create info
      console.log("No customer data found or no customer ID - new user needs to create info");
      
      // Set accountId in the form for creation
      document.getElementById("accountId").value = accountId;
      document.getElementById("customerId").value = "";
      
      // Pre-fill phone from registration/login if available
      const pendingPhone = localStorage.getItem("pendingPhone");
      if (pendingPhone) {
        document.getElementById("customerPhone").value = pendingPhone;
        localStorage.removeItem("pendingPhone");
      }
      
      // Clear justRegistered flag and show message only if this is a new user
      if (isNewUser) {
        localStorage.removeItem("justRegistered");
        showToast("Vui lòng hoàn thiện thông tin cá nhân", "info");
      }
      return;
    }

    // Customer exists - fill form with customer data - support both camelCase and PascalCase
    const fields = [
      { id: "customerId", keys: ["customerId", "CustomerId", "id", "Id"] },
      { id: "accountId", keys: ["accountId", "AccountId"] },
      { id: "customerName", keys: ["customerName", "CustomerName", "name", "Name"] },
      { id: "customerEmail", keys: ["customerEmail", "CustomerEmail", "email", "Email"] },
      { id: "customerPhone", keys: ["customerPhone", "CustomerPhone", "phone", "Phone"] },
      { id: "customerAddress", keys: ["customerAddress", "CustomerAddress", "address", "Address"] },
    ];

    fields.forEach(field => {
      const input = document.getElementById(field.id);
      if (input) {
        let value = "";
        for (const key of field.keys) {
          if (customerData[key] !== undefined && customerData[key] !== null) {
            value = customerData[key];
            break;
          }
        }
        input.value = value;
        console.log(`Set ${field.id} = "${value}"`);
      } else {
        console.warn(`Input element ${field.id} not found`);
      }
    });

    // Format date for input
    const dobValue = customerData.customerDOB || customerData.CustomerDOB || customerData.dob || customerData.DOB;
    console.log("DOB value from API:", dobValue);
    if (dobValue) {
      try {
        const dob = new Date(dobValue);
        const formattedDate = dob.toISOString().split("T")[0];
        document.getElementById("customerDOB").value = formattedDate;
        console.log("Set customerDOB =", formattedDate);
      } catch (e) {
        console.error("Error parsing date:", e);
      }
    }

    // Store customerId in localStorage for order creation
    if (customerId) {
      localStorage.setItem("customerId", customerId);
      console.log("Stored customerId in localStorage:", customerId);
    }
    
    // Store original data for cancel
    originalData = {
      customerId: customerData.customerId || customerData.CustomerId || "",
      customerName: customerData.customerName || customerData.CustomerName || "",
      customerEmail: customerData.customerEmail || customerData.CustomerEmail || "",
      customerPhone: customerData.customerPhone || customerData.CustomerPhone || "",
      customerAddress: customerData.customerAddress || customerData.CustomerAddress || "",
      customerDOB: dobValue,
    };
    
    console.log("originalData stored:", originalData);
    console.log("=== LOAD CUSTOMER INFO COMPLETED ===");
  } catch (error) {
    console.error("Full error details:", error);
    console.error("Error status:", error.status);
    console.error("Error message:", error.message);
    
    // If 404, treat as new user (no customer info exists)
    if (error.status === 404) {
      // Set accountId in the form for creation
      document.getElementById("accountId").value = accountId;
      document.getElementById("customerId").value = "";
      
      // Pre-fill phone if available
      const pendingPhone = localStorage.getItem("pendingPhone");
      if (pendingPhone) {
        document.getElementById("customerPhone").value = pendingPhone;
        localStorage.removeItem("pendingPhone");
      }
      
      // Clear justRegistered flag and show message only if this is a new user
      if (isNewUser) {
        localStorage.removeItem("justRegistered");
        showToast("Vui lòng hoàn thiện thông tin cá nhân", "info");
      }
    } else {
      showToast("Không thể tải thông tin khách hàng: " + (error.message || "Lỗi không xác định"), "error");
    }
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
  const accountId = localStorage.getItem("accountId");
  
  const customerData = {
    accountId: accountId,
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

  

  try {
    // Check if this is creating new or updating existing
    const customerId = document.getElementById("customerId").value;
    
    if (!customerId) {
      // Creating new customer info
      const newCustomer = await createCustomerInfo(customerData);
      
      // Store the new customerId in localStorage for order creation
      const createdCustomerId = newCustomer?.customerId || newCustomer?.CustomerId || newCustomer?.id || newCustomer?.Id;
      if (createdCustomerId) {
        localStorage.setItem("customerId", createdCustomerId);
      }
      
      showToast("Tạo thông tin thành công!", "success");
    } else {
      // Updating existing customer info
      customerData.customerId = customerId;
      await updateCustomerInfo(customerData);
      
      // Update localStorage with the customerId
      localStorage.setItem("customerId", customerId);
      
      showToast("Cập nhật thông tin thành công!", "success");
    }

    // Reload to get the saved data
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  } catch (error) {
    showToast("Lưu thông tin thất bại: " + (error.message || "Lỗi không xác định"), "error");
    console.error("Error saving customer info:", error);
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

