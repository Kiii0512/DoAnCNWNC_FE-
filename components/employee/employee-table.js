import employeeAPI from '../../JS/API/employeeAPI.js';
import { showToast } from '../../utils/toast.js';

class EmployeeTable extends HTMLElement {
  constructor() {
    super();
    this.employees = [];
  }

  connectedCallback() {
    if (this._inited) return;
    this._inited = true;

    this.render();
    this.load();
  }

  async load() {
    try {
      this.employees = await employeeAPI.getAll();
      this.renderTable();
    } catch (e) {
      console.error(e);
      showToast('Không tải được danh sách nhân viên');
    }
  }

  render() {
    this.innerHTML = `
      <div class="employee-table">
        <div class="employee-table__head">
          <div>
            <h3 class="employee-table__title">Danh sách nhân viên</h3>
            <p class="employee-table__hint">Quản lý và theo dõi thông tin nhân viên</p>
          </div>
          <div class="employee-table__tools">
            <button class="btn btn--primary act-create">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Thêm nhân viên
            </button>
          </div>
        </div>

        <div class="employee-table__wrap">
          <table class="employee-table">
            <thead>
              <tr>
                <th>Tên nhân viên</th>
                <th>Số điện thoại</th>
                <th>Ngày sinh</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody class="et-tbody">
              <!-- Rows will be inserted here -->
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  renderTable() {
    const tbody = this.querySelector('.et-tbody');
    if (!tbody) return;

    if (this.employees.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="et-empty">Không có nhân viên nào</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.employees.map(employee => `
      <tr data-id="${employee.staffId}">
        <td>${employee.staffName}</td>
        <td>${employee.phone}</td>
        <td>${this.formatDate(employee.staffDOB)}</td>
        <td>
          <label class="switch">
            <input type="checkbox" class="status-toggle" data-id="${employee.staffId}" ${employee.isActive ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </td>
        <td>
          <button class="btn btn--ghost act-edit" data-id="${employee.staffId}">Sửa</button>
        </td>
      </tr>
    `).join('');

    this.bindRowEvents();
  }

  formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  }

  bindEvents() {
    // No search input in this table, but keeping for consistency
  }

  bindRowEvents() {
    // Create button
    const createBtn = this.querySelector('.act-create');
    if (createBtn) {
      createBtn.onclick = () => {
        const drawer = document.querySelector('employee-drawer');
        if (drawer) drawer.openCreate();
      };
    }

    // Edit buttons
    this.querySelectorAll('.act-edit').forEach(btn => {
      btn.onclick = () => {
        const staffId = btn.dataset.id;
        const drawer = document.querySelector('employee-drawer');
        if (drawer) drawer.openEdit(staffId);
      };
    });

    // Delete buttons
    this.querySelectorAll('.act-delete').forEach(btn => {
      btn.onclick = async () => {
        const staffId = btn.dataset.id;
        if (confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
          try {
            await employeeAPI.delete(staffId);
            showToast('Đã xóa nhân viên thành công');
            await this.load();
          } catch (e) {
            console.error(e);
            showToast('Xóa nhân viên thất bại');
          }
        }
      };
    });

    // Status toggle
    this.querySelectorAll('.status-toggle').forEach(checkbox => {
      checkbox.onchange = async () => {
        const staffId = checkbox.dataset.id;
        const newStatus = checkbox.checked;

        // Disable the checkbox during API call to prevent multiple clicks
        checkbox.disabled = true;

        try {
          const employee = this.employees.find(e => e.staffId === staffId);
          if (!employee) {
            showToast('Không tìm thấy nhân viên');
            checkbox.disabled = false;
            return;
          }

          // For status toggle, we need to update the employee
          // Since the API doesn't have a separate toggle endpoint, we'll use update
          const updatedEmployee = { ...employee, isActive: newStatus };
          await employeeAPI.update(staffId, {
            staffId: updatedEmployee.staffId,
            staffName: updatedEmployee.staffName,
            phone: updatedEmployee.phone,
            staffDOB: updatedEmployee.staffDOB.split('T')[0], // Format date for backend DateOnly
            isActive: newStatus  // Include the status change
          });

          showToast(newStatus ? 'Đã kích hoạt nhân viên' : 'Đã vô hiệu hóa nhân viên');
          await this.load();
        } catch (e) {
          console.error(e);
          showToast(e?.message || 'Cập nhật thất bại');
          // Revert the checkbox state on error
          checkbox.checked = !newStatus;
        } finally {
          // Re-enable the checkbox
          checkbox.disabled = false;
        }
      };
    });
  }

  filterEmployees(query) {
    const filtered = this.employees.filter(employee =>
      employee.staffName.toLowerCase().includes(query.toLowerCase()) ||
      employee.phone.toLowerCase().includes(query.toLowerCase())
    );
    this.renderFilteredTable(filtered);
  }

  renderFilteredTable(filteredEmployees) {
    const tbody = this.querySelector('.et-tbody');
    if (!tbody) return;

    if (filteredEmployees.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="et-empty">Không tìm thấy nhân viên nào</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filteredEmployees.map(employee => `
      <tr data-id="${employee.staffId}">
        <td>${employee.staffName}</td>
        <td>${employee.phone}</td>
        <td>${this.formatDate(employee.staffDOB)}</td>
        <td>
          <label class="switch">
            <input type="checkbox" class="status-toggle" data-id="${employee.staffId}" ${employee.isActive ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </td>
        <td>
          <button class="btn btn--ghost act-edit" data-id="${employee.staffId}">Sửa</button>
        </td>
      </tr>
    `).join('');

    this.bindRowEvents();
  }
}

customElements.define('employee-table', EmployeeTable);
export default EmployeeTable;