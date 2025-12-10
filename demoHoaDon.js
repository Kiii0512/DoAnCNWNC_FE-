
        /* 
          donHang.html (cập nhật): thêm xử lý cho nút Giỏ hàng và Tài khoản ở header
          - giữ logic hiển thị ghi chú mờ khi không có ghi chú
        */

        const KHOA = 'gio_demo_v1';
        const KEY_DON_TAM = 'donHangTam';

        function dinhDangVND(n) { return (Number(n) || 0).toLocaleString('vi-VN') + '₫' }
        function taiGio() { try { return JSON.parse(localStorage.getItem(KHOA)) || [] } catch (e) { return [] } }

        function renderThongTinKhach() {
            const raw = sessionStorage.getItem(KEY_DON_TAM);
            const khu = document.getElementById('khung-thong-tin-khach');
            const khuGhiChu = document.getElementById('khung-ghi-chu');

            if (!raw) {
                khu.innerHTML = '<div class="trong">Không tìm thấy thông tin khách hàng. Vui lòng quay lại trang thanh toán.</div>';
                khuGhiChu.innerHTML = '<div class="khong-co-ghi-chu">Không có ghi chú thêm</div>';
                return;
            }

            try {
                const info = JSON.parse(raw);
                const h = `
          <div style="display:grid;gap:8px">
            <div><strong>Họ và tên:</strong> ${info.hoTen || '—'}</div>
            <div><strong>Số điện thoại:</strong> ${info.dienThoai || '—'}</div>
            <div><strong>Hình thức:</strong> ${info.hinhThuc === 'giao' ? 'Giao tận nơi' : 'Nhận tại cửa hàng'}</div>
            <div><strong>Tỉnh/Thành:</strong> ${info.tinh || '—'}</div>
            <div><strong>Quận/Huyện:</strong> ${info.quan || '—'}</div>
            <div><strong>Địa chỉ:</strong> ${info.diaChi || '—'}</div>
          </div>
        `;
                khu.innerHTML = h;

                if (!info.ghiChu || info.ghiChu.trim() === '') {
                    khuGhiChu.innerHTML = '<div class="khong-co-ghi-chu">Không có ghi chú thêm</div>';
                } else {
                    const nh = info.ghiChu.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>');
                    khuGhiChu.innerHTML = `<div>${nh}</div>`;
                }
            } catch (e) {
                khu.innerHTML = '<div class="trong">Dữ liệu khách hàng không hợp lệ.</div>';
                khuGhiChu.innerHTML = '<div class="khong-co-ghi-chu">Không có ghi chú thêm</div>';
            }
        }

        function renderDanhSachSanPham() {
            const ds = taiGio();
            const khung = document.getElementById('khung-ds-sp');
            const elDsTomTat = document.getElementById('ds-tom-tat');
            const tamTinh = document.getElementById('tam-tinh');
            const tongEl = document.getElementById('tong-thanh-toan');

            if (!ds || ds.length === 0) {
                khung.innerHTML = '<div class="trong">Giỏ hàng của bạn đang trống.</div>';
                elDsTomTat.innerHTML = '<div class="trong">Không có sản phẩm</div>';
                tamTinh.textContent = '0₫';
                tongEl.textContent = '0₫';
                return;
            }

            let html = '';
            let tong = 0;
            let dsTomTatHtml = '';
            ds.forEach(it => {
                const gia = it.gia || it.price || 0;
                const soLuong = Number(it.soLuong) || 1;
                const subtotal = gia * soLuong;
                tong += subtotal;
                html += `
          <div class="ds-item">
            <img src="${it.img}" alt="${it.title}" />
            <div class="tt">
              <div style="font-weight:600">${it.title}</div>
              <div style="font-size:13px;color:var(--muted)">Mã: ${it.id}</div>
            </div>
            <div style="text-align:right">
              <div style="font-size:13px;color:var(--muted)">${soLuong} × ${dinhDangVND(gia)}</div>
              <div class="gia-item">${dinhDangVND(subtotal)}</div>
            </div>
          </div>
        `;
                dsTomTatHtml += `
          <div style="display:flex;justify-content:space-between;padding:6px 0">
            <div style="font-size:14px">${it.title} × ${soLuong}</div>
            <div style="font-weight:700">${dinhDangVND(subtotal)}</div>
          </div>
        `;
            });

            khung.innerHTML = html;
            elDsTomTat.innerHTML = dsTomTatHtml;
            tamTinh.textContent = dinhDangVND(tong);
            tongEl.textContent = dinhDangVND(tong);
        }

        // Xử lý nút Đồng ý (xác nhận đơn)
        document.getElementById('btn-dong-y').addEventListener('click', function () {
            const ds = taiGio();
            const raw = sessionStorage.getItem(KEY_DON_TAM);

            if (!raw || !ds || ds.length === 0) {
                alert('Thiếu thông tin đơn hàng hoặc giỏ hàng trống. Vui lòng kiểm tra lại.');
                return;
            }

            try {
                const don = { thongTin: JSON.parse(raw), sanPham: ds, ngay: new Date().toISOString() };
                console.log('Đơn hàng demo (lưu tạm):', don);
            } catch (e) { console.warn('Không tạo được đơn demo:', e) }

            localStorage.removeItem(KHOA);
            sessionStorage.removeItem(KEY_DON_TAM);

            alert('Đặt hàng thành công! Cảm ơn bạn (demo). Giỏ hàng đã được xóa.');
            renderThongTinKhach();
            renderDanhSachSanPham();
        });

        // Nút quay lại thanh toán
        document.getElementById('btn-quay-lai-thanh-toan').addEventListener('click', function () {
            window.location.href = '../thanh-toan/thanhToan.html';
        });

        // ---- XỬ LÝ NÚT GIỎ & TÀI KHOẢN Ở HEADER ----
        // Giỏ hàng: quay lại trang giỏ 
        document.getElementById('btnGio').addEventListener('click', function () {
            // donHang.html nằm trong thanh-toan/ 
            window.location.href = '../gio-hang/gioHang.html';
        });

        // Tài khoản: demo 
        document.getElementById('btnTK').addEventListener('click', function () {
            alert('Chức năng Tài khoản (demo)');
           
        });

        // Khởi tạo
        (function khoiTao() {
            renderThongTinKhach();
            renderDanhSachSanPham();
        })();