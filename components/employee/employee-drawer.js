import employeeAPI from '../../JS/API/employeeAPI.js';
import { showToast } from '../../utils/toast.js';

class EmployeeDrawer extends HTMLElement {
  constructor() {
    super();
    this._open = false;
    this.employee = null;
    this.isEdit = false;
  }

  connectedCallback() {
    if (this._inited) return;
    this._inited = true;

    this.innerHTML = `
      <div class="employee-drawer__overlay" id="overlay">
        <div class="employee-drawer__panel" id="panel">
          <div class="employee-drawer__header">
            <div>
              <h2 class="employee-drawer__title" id="drawerTitle">Thêm nhân viên</h2>
              <p class="employee-drawer__subtitle" id="drawerSubtitle">Điền thông tin nhân viên mới</p>
            </div>
            <button class="employee-drawer__close" id="closeBtn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="employee-drawer__body">
            <form class="employee-form" id="employeeForm">
              <div class="form-group">
                <label class="form-label" for="staffName">Tên nhân viên *</label>
                <input type="text" class="form-input" id="staffName" name="staffName" required>
              </div>

              <div class="form-group">
                <label class="form-label" for="phone">Số điện thoại *</label>
                <input type="tel" class="form-input" id="phone" name="phone" required>
              </div>

              <div class="form-group">
                <label class="form-label" for="staffDOB">Ngày sinh *</label>
                <input type="date" class="form-input" id="staffDOB" name="staffDOB" required>
              </div>

              <div class="status-toggle-group">
                <label class="status-toggle-label">Trạng thái hoạt động</label>
                <label class="switch">
                  <input type="checkbox" id="isActive" name="isActive" checked>
                  <span class="slider"></span>
                </label>
              </div>
            </form>
          </div>

          <div class="employee-drawer__actions">
            <button class="btn btn--secondary" id="cancelBtn">Hủy</button>
            <button class="btn btn--primary" id="saveBtn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 13l4 4L19 7"/>
              </svg>
              Lưu
            </button>
          </div>
        </div>
      </div>
    `;

    this.$overlay = this.querySelector('#overlay');
    this.$panel = this.querySelector('#panel');
    this.$close = this.querySelector('#closeBtn');
    this.$cancel = this.querySelector('#cancelBtn');
    this.$submit = this.querySelector('#saveBtn');
    this.$title = this.querySelector('#drawerTitle');
    this.$subtitle = this.querySelector('#drawerSubtitle');
    this.$form = this.querySelector('#employeeForm');

    this.$close.onclick = () => this.close();
    this.$overlay.onclick = () => this.close();
    this.$cancel.onclick = () => this.close();
    this.$submit.onclick = (e) => this.handleSubmit(e);

    // Prevent form submission on Enter key to allow typing
    this.$form.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this._open) this.close();
    });
  }

  openCreate() {
    this.isEdit = false;
    this.employee = null;
    this.$title.textContent = 'Thêm nhân viên mới';
    this.$subtitle.textContent = 'Điền thông tin nhân viên mới';
    this.$submit.textContent = 'Thêm';
    this.resetForm();
    this.show();
  }

  async openEdit(staffId) {
    this.isEdit = true;
    this.$title.textContent = 'Sửa thông tin nhân viên';
    this.$subtitle.textContent = 'Cập nhật thông tin nhân viên';
    this.$submit.textContent = 'Cập nhật';

    try {
      this.employee = await employeeAPI.getById(staffId);

      if (!this.employee) {
        showToast('Không tìm thấy nhân viên');
        return;
      }

      this.populateForm();
      this.show();
    } catch (e) {
      console.error(e);
      showToast('Không tải được thông tin nhân viên');
    }
  }

  show() {
    this._open = true;
    this.$overlay.classList.add('employee-drawer__overlay--visible');
    this.$panel.classList.add('employee-drawer__panel--visible');
    document.body.classList.add('no-scroll');
  }

  close() {
    this._open = false;
    this.$overlay.classList.remove('employee-drawer__overlay--visible');
    this.$panel.classList.remove('employee-drawer__panel--visible');
    document.body.classList.remove('no-scroll');
  }

  resetForm() {
    this.$form.reset();
    this.clearErrors();
  }

  populateForm() {
    if (!this.employee) return;

    this.querySelector('#staffName').value = this.employee.staffName || '';
    this.querySelector('#phone').value = this.employee.phone || '';
    this.querySelector('#staffDOB').value = this.formatDate(this.employee.staffDOB);
    this.clearErrors();
  }

  formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  }

  async handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(this.$form);
    const data = Object.fromEntries(formData);

    // Validation
    if (!this.validate(data)) return;

    this.$submit.disabled = true;
    this.$submit.textContent = 'Đang xử lý...';

    try {
      if (this.isEdit) {
        // Update request includes staffId
        const updateData = {
          staffId: this.employee.staffId,
          staffName: data.staffName,
          phone: data.phone,
          staffDOB: data.staffDOB
        };
        await employeeAPI.update(this.employee.staffId, updateData);
        showToast('Đã cập nhật nhân viên');
      } else {
        // Create request
        const createData = {
          phone: data.phone,
          staffName: data.staffName,
          staffDOB: data.staffDOB
        };
        await employeeAPI.create(createData);
        showToast('Đã thêm nhân viên mới');
      }

      // Refresh table
      const table = document.querySelector('employee-table');
      if (table) table.load();

      this.close();
    } catch (e) {
      console.error(e);
      showToast(e?.message || 'Thao tác thất bại');
    } finally {
      this.$submit.disabled = false;
      this.$submit.textContent = this.isEdit ? 'Cập nhật' : 'Thêm';
    }
  }

  validate(data) {
    this.clearErrors();
    let isValid = true;

    // Name validation
    if (!data.staffName?.trim()) {
      this.showError('staffName', 'Tên nhân viên là bắt buộc');
      isValid = false;
    } else if (data.staffName.trim().length < 2) {
      this.showError('staffName', 'Tên nhân viên phải có ít nhất 2 ký tự');
      isValid = false;
    }

    // Phone validation
    if (!data.phone?.trim()) {
      this.showError('phone', 'Số điện thoại là bắt buộc');
      isValid = false;
    } else if (!/^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/.test(data.phone.trim())) {
      this.showError('phone', 'Số điện thoại không hợp lệ');
      isValid = false;
    }

    // Date of birth validation
    if (!data.staffDOB) {
      this.showError('staffDOB', 'Ngày sinh là bắt buộc');
      isValid = false;
    } else {
      const dob = new Date(data.staffDOB);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      if (age < 18) {
        this.showError('staffDOB', 'Nhân viên phải từ 18 tuổi trở lên');
        isValid = false;
      } else if (age > 65) {
        this.showError('staffDOB', 'Tuổi nhân viên không được vượt quá 65');
        isValid = false;
      }
    }

    return isValid;
  }

  showError(fieldName, message) {
    const field = this.querySelector(`#${fieldName}`).closest('.form-group');
    field.classList.add('form-group--error');
    let errorEl = field.querySelector('.field-error');
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.className = 'field-error';
      errorEl.style.cssText = `
        color: #ef4444;
        font-size: 12px;
        margin-top: 4px;
        display: block;
      `;
      field.appendChild(errorEl);
    }
    errorEl.textContent = message;
  }

  clearErrors() {
    this.querySelectorAll('.form-group--error').forEach(el => el.classList.remove('form-group--error'));
    this.querySelectorAll('.field-error').forEach(el => el.remove());
  }
}

customElements.define('employee-drawer', EmployeeDrawer);
export default EmployeeDrawer;
