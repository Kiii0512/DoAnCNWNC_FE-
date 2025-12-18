class accountscontent extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <div class="content">

      <div class="page-title">Account Management</div>
      <div class="breadcrumb">Home / Accounts</div>

      <!-- Tabs -->
      <div class="tools">
        <div>
          <button id="userTab">User Accounts</button>
          <button id="staffTab">Staff Accounts</button>
        </div>
        <button id="addBtn">+ Add Account</button>
      </div>

      <div class="table-card">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="accountTable"></tbody>
        </table>
      </div>
    </div>
    `;

    let currentTab = "user";

    const users = [
      { username: "user01", name: "Nguyễn Văn A", email: "a@gmail.com", role: "User", status: "Active" },
      { username: "user02", name: "Trần Thị B", email: "b@gmail.com", role: "User", status: "Inactive" }
    ];

    const staffs = [
      { username: "admin01", name: "Admin Tổng", email: "admin@gmail.com", role: "Admin", status: "Active" },
      { username: "staff01", name: "Nhân viên 1", email: "staff@gmail.com", role: "Staff", status: "Active" }
    ];

    const tbody = this.querySelector("#accountTable");

    const render = () => {
      tbody.innerHTML = "";
      const data = currentTab === "user" ? users : staffs;

      data.forEach((a, i) => {
        tbody.innerHTML += `
          <tr>
            <td>${a.username}</td>
            <td>${a.name}</td>
            <td>${a.email}</td>
            <td>
              <span class="badge ${a.role === "Admin" ? "active" : ""}">
                ${a.role}
              </span>
            </td>
            <td>
              <span class="badge ${a.status === "Active" ? "active" : ""}">
                ${a.status}
              </span>
            </td>
            <td class="actions">
              <i class="edit" data-i="${i}">✏️</i>
              <i class="delete" data-i="${i}">🗑</i>
            </td>
          </tr>
        `;
      });

      attachEvents();
    };

    const attachEvents = () => {
      this.querySelectorAll(".delete").forEach(btn => {
        btn.onclick = () => {
          const i = btn.dataset.i;
          (currentTab === "user" ? users : staffs).splice(i, 1);
          render();
        };
      });

      this.querySelectorAll(".edit").forEach(btn => {
        btn.onclick = () => {
          const i = btn.dataset.i;
          const data = currentTab === "user" ? users : staffs;
          const acc = data[i];

          acc.name = prompt("Full name:", acc.name) || acc.name;
          acc.email = prompt("Email:", acc.email) || acc.email;

          if (currentTab === "staff") {
            acc.role = prompt("Role (Admin/Staff):", acc.role) || acc.role;
          }

          render();
        };
      });
    };

    this.querySelector("#addBtn").onclick = () => {
      const username = prompt("Username:");
      if (!username) return;

      const name = prompt("Full name:");
      const email = prompt("Email:");
      let role = currentTab === "user" ? "User" : prompt("Role (Admin/Staff):", "Staff");

      (currentTab === "user" ? users : staffs).push({
        username, name, email, role, status: "Active"
      });

      render();
    };

    this.querySelector("#userTab").onclick = () => {
      currentTab = "user";
      render();
    };

    this.querySelector("#staffTab").onclick = () => {
      currentTab = "staff";
      render();
    };

    render();
  }
}

customElements.define("accounts-content", accountscontent);
