# HƯỚNG DẪN THUYẾT TRÌNH ĐỒ ÁN CÔNG NGHỆ THIẾT KẾ WEB NÂNG CAO

## 📋 Đề tài: WEBSITE BÁN ĐỒ ĐIỆN TỬ

---

## PHẦN 1: GIỚI THIỆU TỔNG QUAN (2-3 phút)

### 1.1. Giới thiệu đề tài
- **Tên đề tài:** Website bán đồ điện tử (Electronic Store)
- **Mô tả:** Xây dựng hệ thống thương mại điện tử bán các sản phẩm điện tử (điện thoại, máy tính, phụ kiện...)
- **Phạm vi:** 
  - Người dùng: Khách hàng, Nhân viên, Quản trị viên
  - Chức năng: Mua sản phẩm, quản lý đơn hàng, quản lý kho, báo cáo doanh thu

### 1.2. Mục tiêu đề tài
- **Mục tiêu chung:** Xây dựng một website thương mại điện tử hoàn chỉnh
- **Mục tiêu cụ thể:**
  1. Cung cấp trải nghiệm mua sắm trực tuyến tiện lợi
  2. Quản lý sản phẩm, đơn hàng, khuyến mãi hiệu quả
  3. Hỗ trợ phân quyền người dùng (Admin/Staff/Customer)
  4. Báo cáo doanh thu theo thời gian thực

### 1.3. Đối tượng và phạm vi
- **Đối tượng sử dụng:** 
  - Khách hàng mua sắm online
  - Nhân viên xử lý đơn hàng
  - Quản trị viên quản lý hệ thống
- **Công nghệ sử dụng:**
  - Frontend: JavaScript (Vanilla) + Web Components
  - Backend: ASP.NET Core Web API
  - Database: SQL Server

---

## PHẦN 2: CÔNG NGHỆ SỬ DỤNG (2-3 phút)

### 2.1. Kiến trúc hệ thống
```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Client)                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐ │
│  │  HomePage   │ │  Admin Page │ │      Staff Page         │ │
│  │  (Customer) │ │   (Admin)   │ │       (Staff)           │ │
│  └──────┬──────┘ └──────┬──────┘ └───────────┬─────────────┘ │
└─────────┼───────────────┼────────────────────┼───────────────┘
          │               │                    │
          └───────────────┼────────────────────┘
                          ▼
              ┌───────────────────────┐
              │   ASP.NET Core Web    │
              │        API            │
              │   (localhost:7155)    │
              └───────────┬───────────┘
                          ▼
              ┌───────────────────────┐
              │      SQL Server       │
              │     Database          │
              └───────────────────────┘
```

### 2.2. Frontend Technologies
- **Ngôn ngữ:** JavaScript (ES6+)
- **Architecture:** Web Components (Custom Elements)
- **Routing:** Hash-based routing
- **Styling:** CSS với BEM naming convention
- **External Libraries:**
  - BoxIcons (icons)
  - Chart.js (biểu đồ doanh thu)
  - Intl.NumberFormat (định dạng tiền tệ VND)

### 2.3. Backend Technologies
- **Framework:** ASP.NET Core 6/7 Web API
- **Authentication:** JWT (JSON Web Token) với HttpOnly Cookies
- **CORS:** Cho phép frontend truy cập
- **API Endpoints:** RESTful API

### 2.4. Database
- **Hệ quản trị:** SQL Server
- **ORM:** Entity Framework Core
- **Các bảng chính:**
  - Users/Accounts
  - Customers
  - Employees
  - Products
  - Categories
  - Brands
  - Variations
  - Orders
  - OrderItems
  - CartItems
  - Discounts

---

## PHẦN 3: PHÂN TÍCH VÀ THIẾT KẾ (3-4 phút)

### 3.1. Các chức năng chính

#### 🔹 Chức năng cho Khách hàng:
| STT | Chức năng | Mô tả |
|-----|-----------|-------|
| 1 | Đăng ký/Đăng nhập | Tạo tài khoản, đăng nhập bằng số điện thoại |
| 2 | Xem sản phẩm | Danh sách sản phẩm theo thương hiệu, danh mục |
| 3 | Chi tiết sản phẩm | Xem thông tin, hình ảnh, thông số kỹ thuật |
| 4 | Giỏ hàng | Thêm/xóa/sửa sản phẩm, chọn phiên bản |
| 5 | Thanh toán | Đặt hàng, áp dụng mã giảm giá |
| 6 | Xem đơn hàng | Theo dõi trạng thái đơn hàng |
| 7 | Tìm kiếm | Tìm sản phẩm theo từ khóa |

#### 🔹 Chức năng cho Nhân viên:
| STT | Chức năng | Mô tả |
|-----|-----------|-------|
| 1 | Quản lý đơn hàng | Xem, xác nhận, giao hàng |
| 2 | Xử lý phản hồi | Tiếp nhận phản hồi từ khách hàng |
| 3 | Báo cáo | Xem doanh thu theo ngày/tháng |

#### 🔹 Chức năng cho Quản trị viên:
| STT | Chức năng | Mô tả |
|-----|-----------|-------|
| 1 | Quản lý sản phẩm | Thêm/sửa/xóa sản phẩm, quản lý biến thể |
| 2 | Quản lý danh mục | Thêm/sửa/xóa categories và brands |
| 3 | Quản lý khuyến mãi | Tạo mã giảm giá theo % hoặc tiền |
| 4 | Quản lý nhân viên | Thêm/sửa/xóa tài khoản nhân viên |
| 5 | Báo cáo doanh thu | Xuất CSV, biểu đồ thống kê |

### 3.2. Sơ đồ phân quyền
```
┌─────────────────────────────────────────────────────┐
│                   PHÂN QUYỀN NGƯỜI DÙNG              │
├─────────────┬─────────────────┬─────────────────────┤
│   CUSTOMER  │     STAFF       │       ADMIN         │
├─────────────┼─────────────────┼─────────────────────┤
│ • Đăng nhập │ • Đăng nhập     │ • Đăng nhập         │
│ • Xem SP    │ • Quản lý đơn   │ • Tất cả chức năng  │
│ • Giỏ hàng  │ • Xử lý feedback│ • Quản lý nhân viên │
│ • Đặt hàng  │ • Báo cáo       │ • Quản lý danh mục  │
│ • Xem đơn   │                 │ • Quản lý KM       │
└─────────────┴─────────────────┴─────────────────────┘
```

### 3.3. Database Schema (Các bảng quan hệ chính)
```
Users ───┬──► Customers
         └──► Employees

Categories ──┐
             ├──► Products ◄── Brands
Products ──┬──► Variations
           ├──► OrderItems
           └──► CartItems

Orders ───► OrderItems ───► Variations
Discounts ──► (liên kết với Orders)
```

---

## PHẦN 4: DEMO THỰC TẾ (5-7 phút)

### 4.1. Demo cho Khách hàng

#### Bước 1: Đăng nhập/Đăng ký
- Trình bày: Trang logIn.html
- Chức năng: Đăng nhập bằng số điện thoại, form đăng ký
- Demo: Tạo tài khoản mới, đăng nhập thành công

#### Bước 2: Trang chủ và Danh mục sản phẩm
- Trình bày: homePage.html
- Chức năng: Banner slider, hiển thị sản phẩm theo thương hiệu
- Demo: Cuộn xem sản phẩm, click "Xem tất cả"

#### Bước 3: Chi tiết sản phẩm
- Trình bày: productDetail.html
- Chức năng: Hình ảnh, chọn phiên bản (màu/dung lượng), thông số kỹ thuật
- Demo: Chọn phiên bản, xem thông số kỹ thuật

#### Bước 4: Giỏ hàng
- Trình bày: cartPage.html
- Chức năng: Thêm/xóa sản phẩm, cập nhật số lượng, chọn thanh toán
- Demo: Thêm sản phẩm vào giỏ, điều chỉnh số lượng

#### Bước 5: Thanh toán
- Trình bày: paymentPage.html
- Chức năng: Nhập thông tin giao hàng, áp dụng mã giảm giá
- Demo: Điền thông tin, áp dụng mã KM, đặt hàng

### 4.2. Demo cho Admin/Staff

#### Bước 6: Đăng nhập Admin
- Demo: Đăng nhập bằng tài khoản Admin

#### Bước 7: Dashboard Admin
- Trình bày: adminDashboard.html
- Chức năng: Menu điều hướng phân quyền, quản lý sản phẩm
- Demo: Các chức năng theo role

#### Bước 8: Quản lý sản phẩm (Admin)
- Trình bày: Product Table + Drawer
- Chức năng: Thêm mới sản phẩm, chỉnh sửa, xóa, lọc theo trạng thái
- Demo: Tạo sản phẩm mới với biến thể (màu sắc, dung lượng)

#### Bước 9: Quản lý đơn hàng
- Trình bày: adminOrder.html
- Chức năng: Danh sách đơn hàng, cập nhật trạng thái
- Demo: Xác nhận đơn, đánh dấu đã giao

#### Bước 10: Quản lý danh mục & Thương hiệu
- Trình bày: adminCatalog.html
- Chức năng: Tạo/sửa Categories và Brands
- Demo: Thêm thương hiệu mới

#### Bước 11: Quản lý khuyến mãi
- Trình bày: adminDiscount.html
- Chức năng: Tạo mã giảm giá (theo % hoặc tiền), quản lý thời hạn
- Demo: Tạo mã giảm giá 20%, kiểm tra áp dụng

#### Bước 12: Quản lý nhân viên (Admin)
- Trình bày: adminEmployee.html
- Chức năng: Thêm/sửa/xóa tài khoản nhân viên
- Demo: Tạo tài khoản Staff mới

#### Bước 13: Báo cáo doanh thu
- Trình bày: adminReport.html
- Chức năng: Biểu đồ doanh thu theo ngày, xuất CSV
- Demo: Chọn khoảng thời gian, xuất báo cáo

---

## PHẦN 5: KỸ THUẬT NỔI BẬT (2-3 phút)

### 5.1. Web Components
```javascript
// Ví dụ: Custom Element cho trang sản phẩm
class ProductPage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<product-table></product-table>`;
  }
}
customElements.define('product-page', ProductPage);
```
- **Lợi ích:** Tái sử dụng code, module hóa, dễ bảo trì

### 5.2. Hash-based Routing
```javascript
window.addEventListener('hashchange', () => {
  loadRoute(location.hash.replace('#', ''));
});
```
- **Lợi ích:** Điều hướng trang không cần reload, hỗ trợ browser history

### 5.3. API Service Pattern
```javascript
// Centralized API calls với credentials
export async function apiFetch(path, options = {}) {
  const res = await fetch(url, {
    credentials: "include", // HttpOnly cookie
    headers,
    body
  });
  return json;
}
```
- **Lợi ích:** Tập trung xử lý authentication, error handling

### 5.4. Authentication với JWT + HttpOnly Cookies
- Bảo mật: Token được lưu trong HttpOnly cookie, không thể truy cập bằng JavaScript
- Phân quyền: localStorage lưu role để hiển thị giao diện phù hợp

### 5.5. Product Variations
- Hỗ trợ nhiều biến thể: Màu sắc, Dung lượng, RAM...
- Mỗi biến thể có giá và số lượng riêng

---

## PHẦN 6: KẾT LUẬN (1-2 phút)

### 6.1. Kết quả đạt được
- ✅ Hệ thống hoạt động ổn định
- ✅ Đầy đủ các chức năng cơ bản của thương mại điện tử
- ✅ Giao diện responsive, thân thiện người dùng
- ✅ Hệ thống phân quyền rõ ràng
- ✅ Báo cáo doanh thu trực quan

### 6.2. Hạn chế
- Chưa tích hợp thanh toán online thực tế
- Chưa có chức năng đánh giá sản phẩm
- Chưa hỗ trợ nhiều ngôn ngữ

### 6.3. Hướng phát triển
- Tích hợp thanh toán (MoMo, VNPay, Stripe)
- Thêm chức năng đánh giá & bình luận
- Phát triển mobile app
- Tích hợp AI gợi ý sản phẩm

---

## 📝 GỢI Ý CẤU TRÚC SLIDE

| Slide | Nội dung | Thời gian |
|-------|----------|-----------|
| 1 | Tiêu đề đề tài + Thông tin sinh viên | 30s |
| 2 | Giới thiệu đề tài & Mục tiêu | 1p |
| 3 | Kiến trúc hệ thống | 1p |
| 4 | Công nghệ sử dụng | 1p |
| 5 | Sơ đồ phân quyền | 1p |
| 6 | Các chức năng chính | 2p |
| 7-13 | Demo từng phần | 5-7p |
| 14 | Kỹ thuật nổi bật | 2p |
| 15 | Kết quả & Hạn chế | 1p |
| 16 | Hướng phát triển | 30s |
| 17 | Q&A | 3-5p |

---

## 💡 MẸO KHI THUYẾT TRÌNH

1. **Chuẩn bị kỹ data test**: Sẵn sàng sản phẩm, mã giảm giá, tài khoản demo
2. **Demo flow mượt**: Từ khách hàng → nhân viên → admin
3. **Giải thích rõ ràng**: Đừng chỉ click, hãy nói chức năng gì, tại sao làm vậy
4. **Backup plan**: Chuẩn bị screenshots nếu demo lỗi
5. **Quản lý thời gian**: Tập trung vào phần quan trọng nhất

---

## 🚀 CÁCH CHẠY DỰ ÁN

### Backend:
1. Mở solution `DoAnCNWNC` trong Visual Studio
2. Cấu hình CORS trong Program.cs:
```csharp
builder.Services.AddCors(options => {
  options.AddPolicy("AllowFrontend", policy => {
    policy.WithOrigins("http://127.0.0.1:5500")
          .AllowAnyHeader()
          .AllowAnyMethod();
  });
});
```
3. Chạy ứng dụng (port 7155)

### Frontend:
1. Sử dụng Live Server (VS Code) hoặc http-server
2. Mở `homePage.html` hoặc `logIn.html`
3. Đăng nhập bằng tài khoản test

### Tài khoản demo:
- **Admin:** admin / admin123
- **Staff:** staff / staff123  
- **Customer:** customer / customer123

---

Chúc bạn thuyết trình thành công! 🎉

