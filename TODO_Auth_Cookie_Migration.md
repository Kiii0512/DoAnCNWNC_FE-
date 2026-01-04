# TODO: Chuyển từ localStorage sang Cookie cho AccessToken và AccountId

## Mục tiêu
- Xóa `accessToken` và `accountId` khỏi localStorage
- Sử dụng cookie (HttpOnly) cho accessToken
- Sử dụng cookie cho accountId (có thể đọc bằng JS)

## Files cần sửa

### 1. JS/API/loginApi.js
- [ ] Xóa localStorage.setItem("accesstoken", accessToken)
- [ ] Xóa localStorage.setItem("accountId", accountId)
- [ ] Xóa console.log accessToken

### 2. JS/API/cartApi.js
- [ ] Cập nhật getAuthHeaders() đọc accessToken từ cookie
- [ ] Cập nhật error handling cho 401 (xóa localStorage)

### 3. JS/API/customerApi.js
- [ ] Cập nhật getCustomerInfo() đọc accessToken từ cookie
- [ ] Cập nhật updateCustomerInfo() đọc accessToken từ cookie
- [ ] Cập nhật changePassword() đọc accessToken từ cookie
- [ ] Cập nhật createCustomerInfo() đọc accessToken từ cookie

### 4. JS/API/orderApi.js
- [ ] Cập nhật getAuthHeaders() đọc accessToken từ cookie
- [ ] Thêm hàm getOrdersByCustomer() nếu chưa có

### 5. JS/API/logoutAPI.js
- [ ] Cập nhật đọc accessToken từ cookie
- [ ] Xóa cookie sau khi logout thành công

### 6. JS/pages/cart.js
- [ ] Cập nhật kiểm tra login đọc từ cookie
- [ ] Xóa localStorage.removeItem("accesstoken")
- [ ] Xóa tất cả localStorage liên quan đến accessToken

### 7. JS/pages/userInfo.js
- [ ] Xóa console.log accessToken
- [ ] Cập nhật đọc accountId từ cookie
- [ ] Cập nhật gọi API đọc accessToken từ cookie

### 8. JS/pages/paymentPage.js
- [ ] Cập nhật kiểm tra login đọc từ cookie
- [ ] Cập nhật gọi API đọc accessToken từ cookie

### 9. JS/pages/orders.js
- [ ] Cập nhật đọc accountId từ cookie
- [ ] Cập nhật kiểm tra login đọc từ cookie

### 10. components/QuickModal.js
- [ ] Cập nhật kiểm tra login đọc từ cookie
- [ ] Xóa localStorage liên quan đến accessToken

## Helper Functions cần tạo

```javascript
// Cookie helper functions
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

function deleteCookie(name) {
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}
```

## Note
- Giữ lại localStorage cho: username, role, customerId (nếu cần)
- Xóa hoàn toàn: accesstoken, accountId, refreshtoken khỏi localStorage

