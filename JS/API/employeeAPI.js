import { API_BASE_URL as BASE } from "../config.js";
import { apiFetch, apiFetchData } from "./http.js";

// giữ export để tránh vỡ code nơi khác (nếu có import API_BASE_URL)
export const API_BASE_URL = BASE;

class EmployeeAPI {
  constructor() {
    this.baseURL = `/admin/accounts`; // dùng path relative với API_BASE_URL
  }

  /* =========================
     STATUS TOGGLE
     Backend: PUT /admin/accounts/{id}/status?isActive=true/false
     ========================= */
  async updateStatus(id, isActive) {
    try {
      return await apiFetch(`${this.baseURL}/${encodeURIComponent(id)}/status?isActive=${encodeURIComponent(isActive)}`, {
        method: "PUT",
      });
    } catch (e) {
      const fallback = isActive ? "Kích hoạt nhân viên thất bại" : "Vô hiệu hóa nhân viên thất bại";
      throw new Error(e?.message || fallback);
    }
  }

  /* =========================
     READ
     ========================= */
  async getAll() {
    const data = await apiFetchData(this.baseURL);
    return data || [];
  }

  async getById(id) {
    return apiFetchData(`${this.baseURL}/${encodeURIComponent(id)}`);
  }

  /* =========================
     CREATE / UPDATE
     ========================= */

  /**
   * Create new staff
   * Backend: POST /admin/accounts/create-staff
   * Request: { Phone, Email, StaffName, StaffDOB }
   */
  async create(employeeData) {
    try {
      return await apiFetch(`${this.baseURL}/create-staff`, {
        method: "POST",
        body: {
          Phone: employeeData.phone,
          Email: employeeData.email,
          StaffName: employeeData.staffName,
          StaffDOB: employeeData.staffDOB,
        },
      });
    } catch (e) {
      throw new Error(e?.message || "Tạo nhân viên thất bại");
    }
  }

  /**
   * Update existing staff
   * Backend: PUT /admin/accounts/{id}
   * Request: { StaffId, StaffName, Phone, StaffDOB, IsActive }
   */
  async update(id, employeeData) {
    try {
      return await apiFetch(`${this.baseURL}/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: {
          StaffId: id,
          StaffName: employeeData.staffName,
          Phone: employeeData.phone,
          StaffDOB: employeeData.staffDOB,
          IsActive: employeeData.isActive,
        },
      });
    } catch (e) {
      throw new Error(e?.message || "Cập nhật nhân viên thất bại");
    }
  }
}

export default new EmployeeAPI();
