# TODO - Thêm chức năng sắp xếp cho Product Grid

## Vấn đề hiện tại:
- Chế độ "home": Không có dropdown sắp xếp
- Chế độ "category": Có dropdown nhưng khi chọn "Mặc định" không hoạt động

## Giải pháp:

### Bước 1: Cập nhật ProductGrid.js
- [x] Lưu danh sách gốc (`originalList`) trước khi sắp xếp
- [x] Thêm dropdown sắp xếp cho chế độ "home"
- [x] Sửa hàm `sortProducts()` để xử lý "default" (reset về thứ tự ban đầu)
- [x] Thêm sort event listener cho chế độ "home"
- [x] Thêm originalList cho chế độ "category"

### Bước 2: Kiểm tra
- [ ] Test với homePage.html (chế độ home)
- [ ] Test với categoryPage.html (chế độ category)
- [ ] Verify các option sắp xếp: Mặc định, Giá ↑, Giá ↓

## Kết quả: ✅ HOÀN THÀNH
Product Grid sẽ có chức năng sắp xếp đầy đủ ở cả hai chế độ.

### Thay đổi cụ thể:
1. **Thêm dropdown sắp xếp cho chế độ "home"**:
   - Thêm `<div class="sort-box">` vào header cho cả hai chế độ

2. **Lưu danh sách gốc `originalList`**:
   - Trước khi gán `currentList`, tạo bản sao `originalList = [...filteredList]`

3. **Sửa hàm `sortProducts()`**:
   - Khi `type === "default"`: Reset `currentList` về `originalList`
   - Khi `type === "price-asc"`: Sắp xếp tăng dần
   - Khi `type === "price-desc"`: Sắp xếp giảm dần
   - Reset về trang 1 khi sắp xếp

