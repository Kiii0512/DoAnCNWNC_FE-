// import employeeAPI from '../../JS/API/employeeAPI.js';
// import { showToast } from '../../utils/toast.js';

// class EmployeeTable extends HTMLElement {
//   constructor() {
//     super();
//     this.employees = [];
//   }

//   connectedCallback() {
//     if (this._inited) return;
//     this._inited = true;

//     this.renderLayout();
//     this.bindEvents();
//     this.load();
//   }

//   async load() {
//     try {
//       this.employees = await employeeAPI.getAll();
//       this.renderTable();
//     } catch (err) {
//       console.error(err);
//       showToast('Không tải được danh sách nhân viên', 'error');
//     }
//   }

//   /* ================= RENDER ================= */

//   renderLayout() {
//     this.innerHTML = `
//       <div class="employee-table">
//         <div class="employee-table__head">
//           <div>
//             <h3 class="employee-table__title">Danh sách nhân viên</h3>
//             <p class="employee-table__hint">Quản lý và theo dõi thông tin nhân viên</p>
//           </div>
//           <button class="btn btn--primary act-create">
//             + Thêm nhân viên
//           </button>
//         </div>

//         <div class="employee-table__wrap">
//           <table>
//             <thead>
//               <tr>
//                 <th>Tên</th>
//                 <th>SĐT</th>
//                 <th>Ngày sinh</th>
//                 <th>Trạng thái</th>
//                 <th>Hành động</th>
//               </tr>
//             </thead>
//             <tbody class="et-tbody"></tbody>
//           </table>
//         </div>
//       </div>
//     `;
//   }

//   renderTable() {
//     const tbody = this.querySelector('.et-tbody');
//     if (!tbody) return;

//     if (this.employees.length === 0) {
//       tbody.innerHTML = `
//         <tr>
//           <td colspan="5" class="et-empty">Không có nhân viên</td>
//         </tr>
//       `;
//       return;
//     }

//     tbody.innerHTML = this.employees.map(e => `
//       <tr data-id="${e.staffId}">
//         <td>${e.staffName}</td>
//         <td>${e.phone}</td>
//         <td>${this.formatDate(e.staffDOB)}</td>
//         <td>
//           <label class="switch">
//             <input 
//               type="checkbox" 
//               class="status-toggle" 
//               data-id="${e.staffId}"
//               ${e.isActive ? 'checked' : ''}
//             >
//             <span class="slider"></span>
//           </label>
//         </td>
//         <td>
//           <button class="btn btn--ghost act-edit" data-id="${e.staffId}">
//             Sửa
//           </button>
//         </td>
//       </tr>
//     `).join('');
//   }

//   formatDate(value) {
//     if (!value) return '';
//     return new Date(value).toLocaleDateString('vi-VN');
//   }

//   /* ================= EVENTS ================= */

//   bindEvents() {
//     // Create
//     this.querySelector('.act-create')?.addEventListener('click', () => {
//       document.querySelector('employee-drawer')?.openCreate();
//     });

//     // Event delegation cho tbody
//     this.querySelector('.et-tbody')?.addEventListener('click', (e) => {
//       if (e.target.classList.contains('act-edit')) {
//         const id = e.target.dataset.id;
//         document.querySelector('employee-drawer')?.openEdit(id);
//       }
//     });

//     // Toggle status
//     this.querySelector('.et-tbody')?.addEventListener('change', async (e) => {
//       if (!e.target.classList.contains('status-toggle')) return;

//       const checkbox = e.target;
//       const staffId = checkbox.dataset.id;
//       const newStatus = checkbox.checked;

//       const employee = this.employees.find(
//         e => String(e.staffId) === staffId
//       );

//       if (!employee) {
//         checkbox.checked = !newStatus;
//         showToast('Không tìm thấy nhân viên', 'error');
//         return;
//       }

//       checkbox.disabled = true;

//       try {
//         await employeeAPI.updateStatus(staffId, newStatus);
//         employee.isActive = newStatus;

//         showToast(
//           newStatus ? 'Đã kích hoạt nhân viên' : 'Đã vô hiệu hóa nhân viên',
//           'success'
//         );
//       } catch (err) {
//         console.error(err);
//         checkbox.checked = !newStatus;
//         showToast(err.message || 'Cập nhật thất bại', 'error');
//       } finally {
//         checkbox.disabled = false;
//       }
//     });
//   }
// }

// customElements.define('employee-table', EmployeeTable);
// export default EmployeeTable;


































// import employeeAPI from '../../JS/API/employeeAPI.js';
// import { showToast } from '../../utils/toast.js';

// class EmployeeTable extends HTMLElement {
//   constructor() {
//     super();
//     this.employees = [];
//   }

//   connectedCallback() {
//     if (this._inited) return;
//     this._inited = true;

//     this.renderLayout();
//     this.bindEvents();
//     this.load();
//   }

//   async load() {
//     try {
//       this.employees = await employeeAPI.getAll();
//       this.renderTable();
//     } catch (err) {
//       console.error(err);
//       showToast('Không tải được danh sách nhân viên', 'error');
//     }
//   }

//   /* ================= RENDER ================= */

//   renderLayout() {
//     this.innerHTML = `
//       <div class="employee-table">
//         <div class="employee-table__head">
//           <div>
//             <h3 class="employee-table__title">Danh sách nhân viên</h3>
//             <p class="employee-table__hint">Quản lý và theo dõi thông tin nhân viên</p>
//           </div>
//           <button class="btn btn--primary act-create">
//             + Thêm nhân viên
//           </button>
//         </div>

//         <div class="employee-table__wrap">
//           <table>
//             <thead>
//               <tr>
//                 <th>Tên</th>
//                 <th>SĐT</th>
//                 <th>Ngày sinh</th>
//                 <th>Trạng thái</th>
//                 <th>Hành động</th>
//               </tr>
//             </thead>
//             <tbody class="et-tbody"></tbody>
//           </table>
//         </div>
//       </div>
//     `;
//   }

//   renderTable() {
//     const tbody = this.querySelector('.et-tbody');
//     if (!tbody) return;

//     if (this.employees.length === 0) {
//       tbody.innerHTML = `
//         <tr>
//           <td colspan="5" class="et-empty">Không có nhân viên</td>
//         </tr>
//       `;
//       return;
//     }

//     tbody.innerHTML = this.employees.map(e => `
//       <tr data-id="${e.staffId}">
//         <td>${e.staffName}</td>
//         <td>${e.phone}</td>
//         <td>${this.formatDate(e.staffDOB)}</td>
//         <td>
//           <label class="switch">
//             <input 
//               type="checkbox"
//               class="status-toggle"
//               data-id="${e.staffId}"
//               ${e.isActive ? 'checked' : ''}
//             >
//             <span class="slider"></span>
//           </label>
//         </td>
//         <td>
//           <button class="btn btn--ghost act-edit" data-id="${e.staffId}">
//             Sửa
//           </button>
//         </td>
//       </tr>
//     `).join('');
//   }

//   formatDate(value) {
//     if (!value) return '';
//     return new Date(value).toLocaleDateString('vi-VN');
//   }

//   /* ================= EVENTS ================= */

//   bindEvents() {
//     // Create
//     this.querySelector('.act-create')?.addEventListener('click', () => {
//       document.querySelector('employee-drawer')?.openCreate();
//     });

//     // Edit (event delegation)
//     this.querySelector('.et-tbody')?.addEventListener('click', (e) => {
//       if (e.target.classList.contains('act-edit')) {
//         const id = e.target.dataset.id;
//         document.querySelector('employee-drawer')?.openEdit(id);
//       }
//     });

//     // ===== SWITCH = SOFT DELETE =====
//     this.querySelector('.et-tbody')?.addEventListener('change', async (e) => {
//       if (!e.target.classList.contains('status-toggle')) return;

//       const checkbox = e.target;
//       const staffId = checkbox.dataset.id;
//       const isChecked = checkbox.checked;

//       checkbox.disabled = true;

//       try {
//         if (!isChecked) {
//           // OFF → SOFT DELETE
//           await employeeAPI.disable(staffId);
//           showToast('Đã vô hiệu hóa nhân viên', 'success');
//         } else {
//           // ON → RESTORE (nếu backend có)
//           if (!employeeAPI.restore) {
//             throw new Error('Chức năng khôi phục chưa hỗ trợ');
//           }
//           await employeeAPI.restore(staffId);
//           showToast('Đã kích hoạt nhân viên', 'success');
//         }

//         await this.load(); // reload để đồng bộ DB
//       } catch (err) {
//         console.error(err);
//         checkbox.checked = !isChecked; // rollback UI
//         showToast(err.message || 'Thao tác thất bại', 'error');
//       } finally {
//         checkbox.disabled = false;
//       }
//     });
//   }
// }

// customElements.define('employee-table', EmployeeTable);
// export default EmployeeTable;
























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

    this.renderLayout();
    this.bindEvents();
    this.load();
  }
  
  async load() {
    try {
      this.employees = await employeeAPI.getAll();
      this.renderTable();
    } catch (err) {
      console.error(err);
      showToast('Không tải được danh sách nhân viên', 'error');
    }
  }

  /* ================= RENDER ================= */

  renderLayout() {
    this.innerHTML = `
      <div class="employee-table">
        <div class="employee-table__head">
          <div>
            <h3 class="employee-table__title">Danh sách nhân viên</h3>
            <p class="employee-table__hint">Quản lý và theo dõi thông tin nhân viên</p>
          </div>
          <button class="btn btn--primary act-create">
            + Thêm nhân viên
          </button>
        </div>

        <div class="employee-table__wrap">
          <table>
            <thead>
              <tr>
                <th>Tên</th>
                <th>SĐT</th>
                <th>Ngày sinh</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody class="et-tbody"></tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderTable() {
    const tbody = this.querySelector('.et-tbody');
    if (!tbody) return;

    if (this.employees.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="et-empty">Không có nhân viên</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.employees.map(e => `
      <tr data-id="${e.staffId}">
        <td>${e.staffName}</td>
        <td>${e.phone}</td>
        <td>${this.formatDate(e.staffDOB)}</td>
        <td>
          <label class="switch">
            <input 
              type="checkbox"
              class="status-toggle"
              data-id="${e.staffId}"
              ${e.isActive ? 'checked' : ''}
            >
            <span class="slider"></span>
          </label>
        </td>
        <td>
          <button class="btn btn--ghost act-edit" data-id="${e.staffId}">
            Sửa
          </button>
        </td>
      </tr>
    `).join('');
  }

  formatDate(value) {
    if (!value) return '';
    return new Date(value).toLocaleDateString('vi-VN');
  }

  /* ================= EVENTS ================= */

  bindEvents() {
    // Create
    this.querySelector('.act-create')?.addEventListener('click', () => {
      document.querySelector('employee-drawer')?.openCreate();
    });

    // Edit
    this.querySelector('.et-tbody')?.addEventListener('click', (e) => {
      if (e.target.classList.contains('act-edit')) {
        document.querySelector('employee-drawer')
          ?.openEdit(e.target.dataset.id);
      }
    });

    // Toggle status
    this.querySelector('.et-tbody')?.addEventListener('change', async (e) => {
      if (!e.target.classList.contains('status-toggle')) return;

      const checkbox = e.target;
      const staffId = checkbox.dataset.id;
      const isActive = checkbox.checked;

      const employee = this.employees.find(
        e => String(e.staffId) === staffId
      );

      if (!employee) {
        checkbox.checked = !isActive;
        showToast('Không tìm thấy nhân viên', 'error');
        return;
      }

      checkbox.disabled = true;

      try {
        await employeeAPI.updateStatus(staffId, isActive);
        employee.isActive = isActive;

        showToast(
          isActive ? 'Đã kích hoạt nhân viên' : 'Đã vô hiệu hóa nhân viên',
          'success'
        );
      } catch (err) {
        console.error('Error updating status:', err);
        checkbox.checked = !isActive;
        showToast(err.message || 'Cập nhật trạng thái thất bại', 'error');
      } finally {
        checkbox.disabled = false;
      }
    });
  }
}

customElements.define('employee-table', EmployeeTable);
export default EmployeeTable;
