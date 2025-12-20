class quickModal extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <div class="modal" id="modal">
          <div class="modal-content">
            <div>
              <img id="modalImg" src="" alt="product">
            </div>
            <div style="flex:1">
              <h3 id="modalTitle">Title</h3>
              <p id="modalDesc">Description</p>
              <div style="margin:10px 0"><span id="modalPrice" class="price">0₫</span> <span id="modalOld" class="old"></span></div>
              <div style="display:flex;gap:8px;align-items:center">
                <input type="number" id="qty" value="1" min="1" style="width:80px;padding:8px;border-radius:8px;border:1px solid #e6e9ee">
                <button class="btn" id="addToCartModal">Thêm vào giỏ</button>
              </div>
              <div style="margin-top:14px"><button id="closeModal" class="icon-btn">Đóng</button></div>
            </div>
          </div>
        </div>
      `;

      // Append modal JS handlers (close on click outside etc.)
      const script = document.createElement('script');
      script.textContent = `
        document.getElementById('closeModal').addEventListener('click', closeModal);
        document.getElementById('modal').addEventListener('click', e => {
          if (e.target.id === 'modal') closeModal();
        });
      `;
      this.appendChild(script);
    }
  }
  customElements.define('quick-modal', quickModal);