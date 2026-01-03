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
              <p class="employee-drawer__subtitle" id="drawerSubtitle">
                Điền thông tin nhân viên mới
              </p>
            </div>
            <button class="employee-drawer__close" id="closeBtn">
              ✕
            </button>
          </div>

          <div class="employee-drawer__body">
            <form class="employee-form" id="employeeForm">
              <div class="form-group">
                <label for="staffName">Tên nhân viên *</label>
                <input id="staffName" name="staffName" required />
              </div>

              <div class="form-group">
                <label for="phone">Số điện thoại *</label>
                <input id="phone" name="phone" required />
              </div>

              <div class="form-group">
                <label for="staffDOB">Ngày sinh *</label>
                <input type="date" id="staffDOB" name="staffDOB" required />
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
            <button id="cancelBtn">Hủy</button>
            <button id="saveBtn">Lưu</button>
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

    /* ================= FIX QUAN TRỌNG ================= */
    // ❗ Chặn click trong panel không bubble ra overlay
    this.$panel.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Click nền mờ → đóng drawer
    this.$overlay.addEventListener('click', () => this.close());
    /* ================================================== */

    this.$close.onclick = () => this.close();
    this.$cancel.onclick = () => this.close();
    this.$submit.onclick = (e) => this.handleSubmit(e);

    // Không submit khi bấm Enter
    this.$form.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') e.preventDefault();
    });

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
      if (!this.employee) return showToast('Không tìm thấy nhân viên');

      this.populateForm();
      this.show();
    } catch (e) {
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
    this.querySelector('#staffName').value = this.employee.staffName || '';
    this.querySelector('#phone').value = this.employee.phone || '';
    this.querySelector('#staffDOB').value =
      this.employee.staffDOB?.split('T')[0] || '';
    this.querySelector('#isActive').checked = this.employee.isActive ?? true;
  }

  async handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(this.$form);
    const data = Object.fromEntries(formData);

    // Convert isActive to boolean (backend expects boolean, not string)

    this.$submit.disabled = true;

    try {
      if (this.isEdit) {
        await employeeAPI.update(this.employee.staffId, {
          staffId: this.employee.staffId,
          ...data
        });
        showToast('Đã cập nhật nhân viên');
      } else {
        await employeeAPI.create(data);
        showToast('Đã thêm nhân viên');
      }

      document.querySelector('employee-table')?.load();
      this.close();
    } catch (e) {
      showToast('Thao tác thất bại');
    } finally {
      this.$submit.disabled = false;
    }
  }

  validate(data) {
    this.clearErrors();
    let ok = true;

    if (!data.staffName?.trim()) {
      this.showError('staffName', 'Tên nhân viên bắt buộc');
      ok = false;
    }

    if (!/^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/.test(data.phone || '')) {
      this.showError('phone', 'Số điện thoại không hợp lệ');
      ok = false;
    }

    if (!data.staffDOB) {
      this.showError('staffDOB', 'Ngày sinh bắt buộc');
      ok = false;
    }

    return ok;
  }

  showError(id, msg) {
    const field = this.querySelector(`#${id}`).closest('.form-group');
    field.classList.add('form-group--error');
    const err = document.createElement('div');
    err.className = 'field-error';
    err.textContent = msg;
    field.appendChild(err);
  }

  clearErrors() {
    this.querySelectorAll('.form-group--error').forEach(e => e.classList.remove('form-group--error'));
    this.querySelectorAll('.field-error').forEach(e => e.remove());
  }
}

customElements.define('employee-drawer', EmployeeDrawer);
export default EmployeeDrawer;
