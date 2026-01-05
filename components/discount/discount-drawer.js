
import { createDiscount, updateDiscount, getDiscountById } from '../../JS/API/discountApi.js';
import { showToast } from '../../utils/toast.js';
import { esc } from '../../utils/escape.js';

class DiscountDrawer extends HTMLElement {
  constructor() {
    super();
    this._open = false;
    this.discount = null;
    this.isEdit = false;
  }

  connectedCallback() {
    if (this._inited) return;
    this._inited = true;

    this.innerHTML = `
      <div class="od-overlay" hidden></div>

      <aside class="od-drawer" aria-hidden="true">
        <div class="od-head">
          <div>
            <div class="od-title">Tạo giảm giá mới</div>
            <div class="od-sub muted">—</div>
          </div>
          <button class="btn btn-ghost od-close" type="button">Đóng</button>
        </div>

        <div class="od-body">
          <form class="od-form">
            <div class="od-field">
              <label for="discountName">Tên giảm giá</label>
              <input type="text" id="discountName" name="discountName" required>
            </div>

            <div class="od-field">
              <label for="discountCode">Mã giảm giá</label>
              <input type="text" id="discountCode" name="discountCode" required>
            </div>

            <div class="od-field">
              <label for="discountDescription">Mô tả</label>
              <textarea id="discountDescription" name="discountDescription"></textarea>
            </div>

            <div class="od-field">
              <label for="discountType">Loại giảm giá</label>
              <select id="discountType" name="discountType" required>
                <option value="0">Percentage</option>
                <option value="1">Fixed Amount</option>
                <option value="2">Free Shipping</option>
              </select>
            </div>

            <div class="od-field">
              <label for="discountValue">Giá trị</label>
              <input type="number" id="discountValue" name="discountValue" min="0" step="0.01" required>
            </div>

            <div class="od-field">
              <label for="minOrderValue">Giá trị đơn hàng tối thiểu</label>
              <input type="number" id="minOrderValue" name="minOrderValue" min="0" step="0.01">
            </div>

            <div class="od-field">
              <label for="maxDiscountAmount">Giảm giá tối đa</label>
              <input type="number" id="maxDiscountAmount" name="maxDiscountAmount" min="0" step="0.01">
            </div>

            <div class="od-field">
              <label for="startDate">Ngày bắt đầu</label>
              <input type="datetime-local" id="startDate" name="startDate" required>
            </div>

            <div class="od-field">
              <label for="expireDate">Ngày hết hạn</label>
              <input type="datetime-local" id="expireDate" name="expireDate" required>
            </div>

            <div class="od-field">
              <label for="usageLimit">Giới hạn sử dụng</label>
              <input type="number" id="usageLimit" name="usageLimit" min="1">
            </div>

            <div class="od-field">
              <label>
                <input type="checkbox" id="isActive" name="isActive"> Hoạt động
              </label>
            </div>

            <div class="od-actions">
              <button type="button" class="btn btn--secondary od-cancel">Hủy</button>
              <button type="submit" class="btn btn--primary od-submit">Tạo</button>
            </div>
          </form>
        </div>
      </aside>
    `;

    this.$overlay = this.querySelector('.od-overlay');
    this.$drawer = this.querySelector('.od-drawer');
    this.$close = this.querySelector('.od-close');
    this.$cancel = this.querySelector('.od-cancel');
    this.$submit = this.querySelector('.od-submit');
    this.$title = this.querySelector('.od-title');
    this.$form = this.querySelector('.od-form');

    this.$close.onclick = () => this.close();
    this.$overlay.onclick = () => this.close();
    this.$cancel.onclick = () => this.close();

    this.$form.onsubmit = (e) => this.handleSubmit(e);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this._open) this.close();
    });
  }

  open() {
    this.isEdit = false;
    this.discount = null;
    this.$title.textContent = 'Tạo khuyến mãi mới';
    this.$submit.textContent = 'Tạo';
    this.resetForm();
    this.show();
  }

  async openEdit(discountId) {
    this.isEdit = true;
    this.$title.textContent = 'Sửa khuyến mãi';
    this.$submit.textContent = 'Cập nhật';

    try {
      const res = await getDiscountById(discountId);
      this.discount = res?.data ?? res;

      if (!this.discount) {
        showToast('Không tìm thấy khuyến mãi');
        return;
      }

      this.populateForm();
      this.show();
    } catch (e) {
      console.error(e);
      showToast('Không tải được thông tin khuyến mãi');
    }
  }

  async openView(discountId) {
    this.isEdit = false;
    this.$title.textContent = 'Chi tiết khuyến mãi';
    this.$submit.style.display = 'none';

    try {
      const res = await getDiscountById(discountId);
      this.discount = res?.data ?? res;

      if (!this.discount) {
        showToast('Không tìm thấy khuyến mãi');
        return;
      }

      this.populateForm();
      this.disableForm();
      this.show();
    } catch (e) {
      console.error(e);
      showToast('Không tải được thông tin khuyến mãi');
    }
  }

  show() {
    this._open = true;
    this.$overlay.hidden = false;
    this.$drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  }

  close() {
    this._open = false;
    this.$overlay.hidden = true;
    this.$drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    this.enableForm();
    this.$submit.style.display = '';
  }

  disableForm() {
    const inputs = this.$form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => input.disabled = true);
  }

  enableForm() {
    const inputs = this.$form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => input.disabled = false);
  }

  resetForm() {
    this.$form.reset();
    this.querySelector('#isActive').checked = true;
    this.clearErrors();
  }

  populateForm() {
    if (!this.discount) return;

    // Automatically deactivate expired discounts
    const now = new Date();
    const expireDate = new Date(this.discount.expireDate);
    const isExpired = !isNaN(expireDate.getTime()) && expireDate < now;

    if (isExpired && this.discount.isActive) {
      console.warn('Discount has expired, automatically deactivating');
      this.discount.isActive = false;
    }

    this.querySelector('#discountName').value = this.discount.discountName || '';
    this.querySelector('#discountCode').value = this.discount.discountCode || '';
    this.querySelector('#discountDescription').value = this.discount.discountDescription || '';
    this.querySelector('#discountType').value = this.discount.discountType || 0;
    this.querySelector('#discountValue').value = this.discount.discountValue || 0;
    this.querySelector('#minOrderValue').value = this.discount.minOrderValue || 0;
    this.querySelector('#maxDiscountAmount').value = this.discount.maxDiscountAmount || 0;
    this.querySelector('#startDate').value = this.formatDateTime(this.discount.startDate);
    this.querySelector('#expireDate').value = this.formatDateTime(this.discount.expireDate);
    this.querySelector('#usageLimit').value = this.discount.usageLimit || '';
    this.querySelector('#isActive').checked = this.discount.isActive ?? true;

    this.clearErrors();
  }

  formatDateTime(dateStr) {
    if (!dateStr) return '';

    try {
      // Handle different date formats
      const date = new Date(dateStr);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateStr);
        return '';
      }

      // Format for datetime-local input (YYYY-MM-DDTHH:mm)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (e) {
      console.error('Error formatting date:', dateStr, e);
      return '';
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(this.$form);
    const data = Object.fromEntries(formData);

    // Convert types
    data.discountType = parseInt(data.discountType);
    data.discountValue = parseFloat(data.discountValue);
    data.minOrderValue = parseFloat(data.minOrderValue || 0);
    data.maxDiscountAmount = parseFloat(data.maxDiscountAmount || 0);
    data.usageLimit = parseInt(data.usageLimit || 0);
    data.isActive = formData.has('isActive');

    // Validation with error handling
    try {
      if (!this.validate(data)) return;
    } catch (validationError) {
      console.error('Validation error:', validationError);
      showToast(validationError.message || 'Dữ liệu không hợp lệ');
      return;
    }

    this.$submit.disabled = true;
    this.$submit.textContent = 'Đang xử lý...';

    try {
      if (this.isEdit) {
        data.discountId = this.discount.discountId;
        await updateDiscount(data);
        showToast('Đã cập nhật khuyến mãi');
      } else {
        await createDiscount(data);
        showToast('Đã tạo khuyến mãi');
      }

      // Refresh table
      const table = document.querySelector('discount-table');
      if (table) table.load();

      this.close();
    } catch (e) {
      console.error(e);
      showToast(e?.message || 'Thao tác thất bại');
    } finally {
      this.$submit.disabled = false;
      this.$submit.textContent = this.isEdit ? 'Cập nhật' : 'Tạo';
    }
  }

  validate(data) {
    this.clearErrors();

    let isValid = true;

    // Basic field validation
    if (!data.discountName?.trim()) {
      this.showError('discountName', 'Tên giảm giá là bắt buộc');
      isValid = false;
    }

    if (!data.discountCode?.trim()) {
      this.showError('discountCode', 'Mã giảm giá là bắt buộc');
      isValid = false;
    }

    if (data.discountValue <= 0) {
      this.showError('discountValue', 'Giá trị phải lớn hơn 0');
      isValid = false;
    }

    // Date validation
    const startDate = new Date(data.startDate);
    const expireDate = new Date(data.expireDate);
    const now = new Date();

    // Check if dates are valid
    if (!data.startDate || isNaN(startDate.getTime())) {
      this.showError('startDate', 'Ngày bắt đầu không hợp lệ');
      isValid = false;
    }

    if (!data.expireDate || isNaN(expireDate.getTime())) {
      this.showError('expireDate', 'Ngày hết hạn không hợp lệ');
      isValid = false;
    }

    if (isValid) {
      // For new discounts, start date must be in the future
      // For editing, allow past dates but expire date must be after start date
      if (!this.isEdit && startDate <= now) {
        this.showError('startDate', 'Ngày bắt đầu phải trong tương lai');
        isValid = false;
      }

      // Expire date must be after start date
      if (expireDate <= startDate) {
        this.showError('expireDate', 'Ngày hết hạn phải sau ngày bắt đầu');
        isValid = false;
      }

      // Minimum duration: 1 hour
      const minDuration = new Date(startDate.getTime() + 60 * 60 * 1000);
      if (expireDate < minDuration) {
        this.showError('expireDate', 'Thời gian khuyến mãi phải ít nhất 1 giờ');
        isValid = false;
      }

      // Reasonable future limit: 5 years
      const maxFutureDate = new Date();
      maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 5);

      if (startDate > maxFutureDate) {
        this.showError('startDate', 'Ngày bắt đầu không thể quá 5 năm trong tương lai');
        isValid = false;
      }

      if (expireDate > maxFutureDate) {
        this.showError('expireDate', 'Ngày hết hạn không thể quá 5 năm trong tương lai');
        isValid = false;
      }
    }

    return isValid;
  }

  isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  hasDSTTransition(date) {
    // Simple DST detection - in most locations, clocks change in March and November
    const month = date.getMonth();
    const day = date.getDate();
    return (month === 2 && day >= 8 && day <= 15) || (month === 10 && day >= 1 && day <= 8);
  }

  showError(fieldName, message) {
    const field = this.querySelector(`#${fieldName}`).closest('.od-field');
    field.classList.add('od-field--error');
    let errorEl = field.querySelector('.od-error');
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.className = 'od-error';
      field.appendChild(errorEl);
    }
    errorEl.textContent = message;
  }

  clearErrors() {
    this.querySelectorAll('.od-field--error').forEach(el => el.classList.remove('od-field--error'));
    this.querySelectorAll('.od-error').forEach(el => el.remove());
  }
}

customElements.define('discount-drawer', DiscountDrawer);
export default DiscountDrawer;  