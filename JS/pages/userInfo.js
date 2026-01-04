import {
  getCustomerInfo,
  updateCustomerInfo,
  changePassword,
  createCustomerInfo
} from "../API/customerApi.js";

/* ================= DOM ================= */
const userInfoForm = document.getElementById("userInfoForm");
const changePasswordForm = document.getElementById("changePasswordForm");
const changePasswordSection = document.getElementById("changePasswordSection");
const newCustomerBanner = document.getElementById("newCustomerBanner");
const toast = document.getElementById("toast");
const btnCancel = document.getElementById("btnCancel");
const btnSave = document.querySelector(".btn-save");
const userInfoHeader = document.querySelector(".user-info-header");

/* ================= STATE ================= */
let originalData = {};
let isNewCustomer = false;
const justRegistered = localStorage.getItem("justRegistered");

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", async () => {
  await loadCustomerInfo();
  initEventListeners();
});

/* ================= LOAD CUSTOMER ================= */
async function loadCustomerInfo() {
  try {
    const response = await getCustomerInfo(); // 🔥 accountId lấy từ token

    const customerData = response?.data || response;
    if (!customerData) {
      handleNewCustomer();
      return;
    }

    isNewCustomer = false;
    fillForm(customerData);
    storeOriginalData(customerData);

    localStorage.removeItem("justRegistered");
  } catch (error) {
    console.error("loadCustomerInfo error:", error);

    if (error.message?.includes("401")) {
      showToast("Vui lòng đăng nhập để tiếp tục", "error");
      setTimeout(() => {
        window.location.href = "logIn.html?mode=login";
      }, 1500);
      return;
    }

    if (error.message?.includes("404")) {
      handleNewCustomer();
      return;
    }

    showToast("Không thể tải thông tin người dùng", "error");
  }
}

/* ================= NEW CUSTOMER ================= */
function handleNewCustomer() {
  isNewCustomer = true;
  
  // Clear customerId field for new customer
  document.getElementById("customerId").value = "";
  
  // Show new customer banner
  if (newCustomerBanner) {
    newCustomerBanner.classList.remove("hidden");
  }
  
  // Hide change password section for new customers
  if (changePasswordSection) {
    changePasswordSection.classList.add("hidden");
  }
  
  // Disable cancel button (nothing to reset for new customers)
  if (btnCancel) {
    btnCancel.disabled = true;
  }
  
  // Change save button text
  if (btnSave) {
    btnSave.innerHTML = '<i class="bx bxs-user-plus"></i> Tạo thông tin';
  }
  
  // Update form header styling
  if (userInfoHeader) {
    userInfoHeader.classList.add("new-customer");
  }

  if (justRegistered === "true") {
    localStorage.removeItem("justRegistered");
    showToast("Vui lòng hoàn thiện thông tin cá nhân", "info");
  } else {
    showToast("Vui lòng nhập thông tin cá nhân của bạn", "info");
  }

  const pendingPhone = localStorage.getItem("pendingPhone");
  if (pendingPhone) {
    document.getElementById("customerPhone").value = pendingPhone;
    localStorage.removeItem("pendingPhone");
  }
}

/* ================= FILL FORM ================= */
function fillForm(data) {
  setValue("customerId", data.customerId || data.CustomerId || "");
  setValue("customerName", data.customerName || data.CustomerName || "");
  setValue("customerEmail", data.customerEmail || data.CustomerEmail || "");
  setValue("customerPhone", data.customerPhone || data.CustomerPhone || "");
  setValue("customerAddress", data.customerAddress || data.CustomerAddress || "");

  const dob = data.customerDOB || data.CustomerDOB;
  if (dob) {
    document.getElementById("customerDOB").value =
      new Date(dob).toISOString().split("T")[0];
  }
}

function setValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

/* ================= ORIGINAL DATA ================= */
function storeOriginalData(data) {
  originalData = {
    customerName: data.customerName || "",
    customerEmail: data.customerEmail || "",
    customerPhone: data.customerPhone || "",
    customerAddress: data.customerAddress || "",
    customerDOB: data.customerDOB || null
  };
}

/* ================= EVENTS ================= */
function initEventListeners() {
  userInfoForm?.addEventListener("submit", async e => {
    e.preventDefault();
    await saveCustomerInfo();
  });

  btnCancel?.addEventListener("click", resetFormToOriginal);

  changePasswordForm?.addEventListener("submit", async e => {
    e.preventDefault();
    await updatePassword();
  });

  document.querySelectorAll(".toggle-password").forEach(btn => {
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.dataset.target);
      const icon = btn.querySelector("i");

      input.type = input.type === "password" ? "text" : "password";
      icon.classList.toggle("bxs-hide");
      icon.classList.toggle("bxs-show");
    });
  });
}

/* ================= SAVE CUSTOMER ================= */
async function saveCustomerInfo() {
  const customerData = {
    customerName: valueOf("customerName"),
    customerEmail: valueOf("customerEmail"),
    customerPhone: valueOf("customerPhone"),
    customerAddress: valueOf("customerAddress"),
    customerDOB: document.getElementById("customerDOB").value || null
  };

  if (
    !customerData.customerName ||
    !customerData.customerEmail ||
    !customerData.customerPhone ||
    !customerData.customerAddress
  ) {
    showToast("Vui lòng điền đầy đủ thông tin", "error");
    return;
  }

  try {
    const customerId = valueOf("customerId");

    if (!customerId) {
      await createCustomerInfo(customerData);
      showToast("Tạo thông tin thành công!", "success");
    } else {
      customerData.customerId = customerId;
      await updateCustomerInfo(customerData);
      showToast("Cập nhật thông tin thành công!", "success");
    }

    setTimeout(() => location.reload(), 1200);
  } catch (error) {
    console.error("saveCustomerInfo error:", error);
    showToast(error.message || "Lưu thông tin thất bại", "error");
  }
}

function valueOf(id) {
  return document.getElementById(id)?.value.trim();
}

/* ================= RESET FORM ================= */
function resetFormToOriginal() {
  setValue("customerName", originalData.customerName);
  setValue("customerEmail", originalData.customerEmail);
  setValue("customerPhone", originalData.customerPhone);
  setValue("customerAddress", originalData.customerAddress);

  if (originalData.customerDOB) {
    document.getElementById("customerDOB").value =
      new Date(originalData.customerDOB).toISOString().split("T")[0];
  }

  showToast("Đã khôi phục dữ liệu ban đầu", "info");
}

/* ================= CHANGE PASSWORD ================= */
async function updatePassword() {
  const currentPassword = valueOf("currentPassword");
  const newPassword = valueOf("newPassword");
  const confirmPassword = valueOf("confirmPassword");

  if (!currentPassword || !newPassword || !confirmPassword) {
    showToast("Vui lòng nhập đầy đủ mật khẩu", "error");
    return;
  }

  if (newPassword !== confirmPassword) {
    showToast("Mật khẩu mới không khớp", "error");
    return;
  }

  try {
    await changePassword(currentPassword, newPassword);
    showToast("Đổi mật khẩu thành công!", "success");
    changePasswordForm.reset();
  } catch (error) {
    console.error("changePassword error:", error);
    showToast(error.message || "Đổi mật khẩu thất bại", "error");
  }
}

/* ================= TOAST ================= */
function showToast(message, type = "info") {
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove("show"), 3000);
}
