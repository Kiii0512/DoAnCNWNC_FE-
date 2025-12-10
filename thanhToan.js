   /*
      Script xử lý:
      - Lấy dữ liệu giỏ hàng từ localStorage (khóa KHOA) để render 
      - Kiểm tra validation khi bấm nút Tiến hành đặt hàng: nếu trường bắt buộc trống thì hiển thị thông báo lỗi (không được để trống)
      - Nếu chọn "Nhận tại cửa hàng" thì ẩn phần địa chỉ
      - Số điện thoại: tự loại bỏ ký tự không phải số khi gõ, maxlength=11, validate bắt buộc là 8-11 chữ số
      - Khi hợp lệ: chuyển sang trang chuyenkhoan.html (và lưu tạm form vào sessionStorage để trang chuyển khoản có thể đọc nếu cần)
    */

    const KHOA = 'gio_demo_v1'; // cùng key với trang giỏ hàng

    // Hàm đọc giỏ hàng từ localStorage
    function taiGio(){ try{ return JSON.parse(localStorage.getItem(KHOA)) || [] }catch(e){ return [] } }

    // Format tiền VND
    function dinhDangVND(n){ return n.toLocaleString('vi-VN') + '₫' }

    // Render tóm tắt sản phẩm vào aside
    function renderTomTat(){
      const ds = taiGio();
      const elDs = document.getElementById('ds-tom-tat');
      elDs.innerHTML = '';
      let tong = 0;
      if(!ds || ds.length===0){
        elDs.innerHTML = '<div style="padding:12px;color:var(--muted)">Giỏ hàng của bạn đang trống.</div>';
      } else {
        ds.forEach(it => {
          const tien = it.soLuong * it.gia;
          tong += tien;
          const div = document.createElement('div');
          div.className = 'ds-item';
          div.innerHTML = `
            <img src="${it.img}" alt="${it.title}" />
            <div class="tt">
              <div style="font-weight:600">${it.title}</div>
              <div style="font-size:13px;color:var(--muted)">${it.soLuong} x ${dinhDangVND(it.gia)}</div>
            </div>
            <div style="font-weight:700">${dinhDangVND(tien)}</div>
          `;
          elDs.appendChild(div);
        });
      }
      document.getElementById('tam-tinh').textContent = dinhDangVND(tong);
      document.getElementById('tong-thanh-toan').textContent = dinhDangVND(tong);
    }

    // Hiển thị/ẩn phần địa chỉ dựa trên radio
    function capNhatHienThiDiaChi(){
      const val = document.querySelector('input[name="hinhThuc"]:checked').value;
      const node = document.getElementById('khu-dia-chi');
      if(val === 'giao') node.style.display = 'block'; else node.style.display = 'none';
    }

    // Hàm hiển thị lỗi cho field
    function hienThiLoi(idLoi, hien){
      const el = document.getElementById(idLoi);
      if(!el) return;
      if(hien) el.classList.add('hien'); else el.classList.remove('hien');
    }

    // Validate form: trả về true nếu hợp lệ, false nếu có lỗi
    function validateForm(){
      let hopLe = true;
      const hoTen = document.getElementById('hoTen').value.trim();
      const dienThoai = document.getElementById('dienThoai').value.trim();
      const hinhThuc = document.querySelector('input[name="hinhThuc"]:checked').value;

      // Họ tên
      if(hoTen === ''){ hienThiLoi('loi-hoTen', true); hopLe = false; } else hienThiLoi('loi-hoTen', false);

      // Số điện thoại: phải có, phải là 8-11 chữ số
      const reDT = /^\d{8,11}$/;
      if(dienThoai === ''){ 
        // để trống
        document.getElementById('loi-dienThoai').textContent = 'Vui lòng nhập số điện thoại (8–11 chữ số)';
        hienThiLoi('loi-dienThoai', true); hopLe = false; 
      } else if(!reDT.test(dienThoai)){
        // không hợp lệ 
        document.getElementById('loi-dienThoai').textContent = 'Số điện thoại phải là chữ số và có 8–11 ký tự';
        hienThiLoi('loi-dienThoai', true); hopLe = false;
      } else {
        hienThiLoi('loi-dienThoai', false);
      }

      // Nếu chọn giao tận nơi thì kiểm tra các trường địa chỉ
      if(hinhThuc === 'giao'){
        const tinh = document.getElementById('tinh').value;
        const quan = document.getElementById('quan').value;
        const diaChi = document.getElementById('diaChi').value.trim();
        if(tinh === ''){ hienThiLoi('loi-tinh', true); hopLe = false; } else hienThiLoi('loi-tinh', false);
        if(quan === ''){ hienThiLoi('loi-quan', true); hopLe = false; } else hienThiLoi('loi-quan', false);
        if(diaChi === ''){ hienThiLoi('loi-diaChi', true); hopLe = false; } else hienThiLoi('loi-diaChi', false);
      } else {
        // ẩn mọi lỗi địa chỉ khi chọn nhận tại cửa hàng
        hienThiLoi('loi-tinh', false); hienThiLoi('loi-quan', false); hienThiLoi('loi-diaChi', false);
      }

      // Kiểm tra checkbox đồng ý
      const dongY = document.getElementById('dongY').checked;
      if(!dongY){ hienThiLoi('loi-dongY', true); hopLe = false; } else hienThiLoi('loi-dongY', false);

      return hopLe;
    }

    // Khi bấm nút xác nhận: validate, nếu ok thì chuyển sang trang demoHoaDon.html
    document.getElementById('nut-xac-nhan').addEventListener('click', function(){
      // Xóa các lỗi hiện tại
      document.querySelectorAll('.bao-loi').forEach(el=>el.classList.remove('hien'));

      if(!validateForm()){
        // nếu có lỗi, scroll tới vị trí form để người dùng thấy lỗi
        document.getElementById('form-thanh-toan').scrollIntoView({behavior:'smooth', block:'center'});
        return;
      }

      // Nếu hợp lệ: lưu tạm form vào sessionStorage để trang chuyển khoản có thể dùng (tùy chọn)
      const formTam = {
        hoTen: document.getElementById('hoTen').value.trim(),
        dienThoai: document.getElementById('dienThoai').value.trim(),
        hinhThuc: document.querySelector('input[name="hinhThuc"]:checked').value,
        tinh: document.getElementById('tinh').value,
        quan: document.getElementById('quan').value,
        diaChi: document.getElementById('diaChi').value.trim(),
        ghiChu: document.getElementById('ghiChu').value.trim()
      };
      try {
        sessionStorage.setItem('donHangTam', JSON.stringify(formTam));
      } catch(e){ /* nếu trình duyệt chặn storage, vẫn chuyển trang */ }

      // Chuyển sang trang chuyển khoản (không submit form server-side ở đây)
      window.location.href = '../demo-hoa-don/demoHoaDon.html';
    });

    // Nút quay lại giỏ hàng
    document.getElementById('nut-quay-lai').addEventListener('click', function(){
      // Chuyển về trang giỏ hàng 
      window.location.href = '../gio-hang/gioHang.html';
    });

    // Lắng nghe thay đổi radio để show/hide địa chỉ
    document.querySelectorAll('input[name="hinhThuc"]').forEach(r=> r.addEventListener('change', capNhatHienThiDiaChi));

    // Khi thay đổi giá trị input
    ['hoTen','dienThoai','tinh','quan','diaChi'].forEach(id => {
      const el = document.getElementById(id);
      if(!el) return;
      el.addEventListener('input', ()=>{
        // Nếu là số điện thoại: loại bỏ ký tự không phải chữ số ngay khi gõ
        if(id === 'dienThoai'){
          el.value = el.value.replace(/\D/g, ''); // chỉ giữ chữ số
          // cập nhật thông báo mặc định 
          document.getElementById('loi-dienThoai').textContent = 'Vui lòng nhập số điện thoại (8–11 chữ số)';
          // ẩn lỗi khi người dùng nhập
          hienThiLoi('loi-dienThoai', false);
          return;
        }
        // mapping id -> lỗi cụ thể
        const map = { hoTen: 'loi-hoTen', dienThoai: 'loi-dienThoai', tinh: 'loi-tinh', quan: 'loi-quan', diaChi: 'loi-diaChi' };
        if(map[id]) hienThiLoi(map[id], false);
      });
    });

    // Khởi tạo trang
    (function khoiTao(){
      renderTomTat();
      capNhatHienThiDiaChi();
    })();