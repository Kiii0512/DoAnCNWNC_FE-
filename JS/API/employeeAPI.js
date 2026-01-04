export const API_BASE_URL = 'https://localhost:7155/api';

function authHeaders() {
  const token = localStorage.getItem('accesstoken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

class EmployeeAPI {
  constructor() {
    this.baseURL = `${API_BASE_URL}/admin/accounts`;
  }

  /* =========================
     🔁 STATUS TOGGLE
     Backend: PUT /accounts/{id}/status?isActive=true/false
     ========================= */

  /**
   * Toggle trạng thái nhân viên (active/inactive)
   */
  async updateStatus(id, isActive) {
    const response = await fetch(`${this.baseURL}/${id}/status?isActive=${isActive}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      }
    });

    if (!response.ok) {
      let message = isActive ? 'Kích hoạt nhân viên thất bại' : 'Vô hiệu hóa nhân viên thất bại';
      try {
        const err = await response.json();
        message = err.message || message;
      } catch {}
      throw new Error(message);
    }

    return response.json();
  }

  /* =========================
     📥 READ
     ========================= */

  async getAll() {
    const response = await fetch(this.baseURL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const result = await response.json();
    return result.data || [];
  }

  async getById(id) {
    const response = await fetch(`${this.baseURL}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  }

  /* =========================
     ✏️ CREATE / UPDATE
     ========================= */

  /**
   * Create new staff
   * Backend: POST /admin/accounts/create-staff
   * Request: { Phone, Email, StaffName, StaffDOB }
   */
  async create(employeeData) {
    const response = await fetch(`${this.baseURL}/create-staff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify({
        Phone: employeeData.phone,
        Email: employeeData.email,
        StaffName: employeeData.staffName,
        StaffDOB: employeeData.staffDOB
      })
    });

    if (!response.ok) {
      let message = 'Tạo nhân viên thất bại';
      try {
        const err = await response.json();
        message = err.message || message;
      } catch {}
      throw new Error(message);
    }

    return response.json();
  }

  /**
   * Update existing staff
   * Backend: PUT /admin/accounts/{id}
   * Request: { StaffId, StaffName, Phone, StaffDOB, IsActive }
   */
  async update(id, employeeData) {
    const response = await fetch(`${this.baseURL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify({
        StaffId: id,
        StaffName: employeeData.staffName,
        Phone: employeeData.phone,
        StaffDOB: employeeData.staffDOB,
        IsActive: employeeData.isActive
      })
    });

    if (!response.ok) {
      let message = 'Cập nhật nhân viên thất bại';
      try {
        const err = await response.json();
        message = err.message || message;
      } catch {}
      throw new Error(message);
    }

    return response.json();
  }
}

export default new EmployeeAPI();
