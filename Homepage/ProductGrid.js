class ProductGrid extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <style>
            .grid { display: grid; grid-template-columns: repeat(4,1fr); gap:18px; margin-top:20px }
            .card { background:#fff; padding:12px; border-radius:12px; border:1px solid #eef2f7; display:flex; flex-direction:column; gap:10px }
            .card img { width:100%; height:180px; object-fit:contain }
            .price { font-weight:700; color:#0f1724 }
            .old { color:#9aa3b2; text-decoration:line-through; font-size:13px }
            .badge { background:#ffefef; color:#c0392b; padding:6px 8px; border-radius:8px; font-size:13px; align-self:flex-start }
            .card .actions { margin-top:auto; display:flex; gap:8px }
            .card .actions button { flex:1; padding:10px; border-radius:8px; border:0; cursor:pointer }
            .card .actions .buy-btn{background:#0f1724;color:#fff}
            .card .actions .buy-btn:hover{background:#23334e}

            /* Small responsive bits (kept from original) */
            @media (max-width:1000px) { .grid { grid-template-columns: repeat(3,1fr) } }
            @media (max-width:760px) { .grid { grid-template-columns: repeat(2,1fr) } }
            @media (max-width:420px) { .grid { grid-template-columns: repeat(1,1fr) } }
        </style>

        <main class="container">
          <section id="products">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px">
              <h2>Sản phẩm nổi bật</h2>
              <div>
                <select id="sort">
                  <option value="popular">Phổ biến</option>
                  <option value="price-asc">Giá: thấp → cao</option>
                  <option value="price-desc">Giá: cao → thấp</option>
                </select>
              </div>
            </div>

            <div class="grid" id="grid"></div>
          </section>
        </main>
      `;

      // Append the JS from original home1.js (loadProducts, renderCards, cart logic).
      const script = document.createElement('script');
      script.textContent = `
        // ===============================
        // LOAD PRODUCTS FROM API (giữ nguyên)
        // ===============================
        let products = [];
        async function loadProducts() {
          try {
            const res = await fetch("YOUR_API/api/products");
            products = await res.json();

            renderCards(products);
            updateCartUI();
          } catch (err) {
            console.error("API Error:", err);
          }
        }

        // ===============================
        // CART STATE
        // ===============================
        let cart = {};

        const grid = document.getElementById('grid');
        const cartCount = document.getElementById('cartCount');
        const cartPanel = document.getElementById('cartPanel');
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');

        function formatPrice(n) { return Number(n).toLocaleString('vi-VN') + '₫' }

        // ===============================
        // RENDER PRODUCT CARDS
        // ===============================
        function renderCards(list) {
          grid.innerHTML = '';

          list.forEach(p => {
            const el = document.createElement('div');
            el.className = 'card';

            el.innerHTML = \`
              <div style="display:flex;justify-content:space-between;align-items:center">
                <div style="font-size:13px;color:#5b6b76">\${p.title.split(' ').slice(0,3).join(' ')}...</div>
                <div class="badge">-\${Math.round((1 - p.price / p.old) * 100)}%</div>
              </div>

              <img src="\${p.img}" alt="\${p.title}"/>

              <div>
                <div style="min-height:40px">\${p.title}</div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
                  <div>
                    <div class="price">\${formatPrice(p.price)}</div>
                    <div class="old">\${formatPrice(p.old)}</div>
                  </div>

                  <div class="actions">
                    <button onclick="quickView(\${p.id})" class="icon-btn">Xem</button>
                    <button onclick="addToCart(\${p.id},1)" class="btn">Thêm</button>
                  </div>
                </div>
              </div>
            \`;

            grid.appendChild(el);
          });
        }

        // ===============================
        // QUICK VIEW MODAL (handlers used by renderCards)
        // ===============================
        function quickView(id) {
          const p = products.find(x => x.id === id);
          if (!p) return;

          document.getElementById('modalImg').src = p.img;
          document.getElementById('modalTitle').textContent = p.title;
          document.getElementById('modalDesc').textContent = "Mô tả sản phẩm (demo).";
          document.getElementById('modalPrice').textContent = formatPrice(p.price);
          document.getElementById('modalOld').textContent = formatPrice(p.old);
          document.getElementById('qty').value = 1;

          document.getElementById('addToCartModal').onclick = () => {
            addToCart(p.id, Number(document.getElementById('qty').value));
            closeModal();
          };

          document.getElementById('modal').classList.add('open');
        }

        function closeModal() {
          document.getElementById('modal').classList.remove('open');
        }

        // ===============================
        // CART FUNCTIONS
        // ===============================
        function addToCart(id, qty) {
          if (!cart[id]) cart[id] = 0;
          cart[id] += qty;
          updateCartUI();
        }

        function updateCartUI() {
          const ids = Object.keys(cart);

          if (cartCount) cartCount.textContent = ids.reduce((s, k) => s + cart[k], 0);
          if (cartPanel) cartPanel.style.display = ids.length > 0 ? 'block' : 'none';

          if (!cartItems) return;
          cartItems.innerHTML = '';
          let total = 0;

          ids.forEach(k => {
            const p = products.find(x => x.id == k);
            const qty = cart[k];
            if (!p) return;

            const row = document.createElement('div');
            row.className = 'cart-item';

            row.innerHTML = \`
              <img src="\${p.img}" style="width:56px;height:56px;object-fit:contain;border-radius:6px">
              <div style="flex:1">
                <div style="font-size:14px">\${p.title}</div>
                <div style="font-size:13px;color:#6b7280">\${formatPrice(p.price)} × \${qty}</div>
              </div>
              <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
                <button onclick="inc(\${p.id})" class="icon-btn">+</button>
                <button onclick="dec(\${p.id})" class="icon-btn">-</button>
              </div>
            \`;

            cartItems.appendChild(row);
            total += p.price * qty;
          });

          if (cartTotal) cartTotal.textContent = formatPrice(total);
        }

        function inc(id) { addToCart(id, 1) }

        function dec(id) {
          if (!cart[id]) return;
          cart[id]--;
          if (cart[id] <= 0) delete cart[id];
          updateCartUI();
        }

        // ===============================
        // EVENTS (search/sort/clear/checkout)
        // ===============================
        document.addEventListener('click', function() {
          // ensure event listeners added after DOM ready (some elements are in other components)
        });

        // attach events after short timeout to allow other components to mount-- chưa rõ

        setTimeout(() => {
          const searchBtn = document.getElementById('searchBtn');
          if (searchBtn) searchBtn.addEventListener('click', () => {
            const q = document.getElementById('q').value.toLowerCase();
            const filtered = products.filter(p => p.title.toLowerCase().includes(q));
            renderCards(filtered);
          });

          const sortEl = document.getElementById('sort');
          if (sortEl) sortEl.addEventListener('change', (e) => {
            let list = [...products];
            if (e.target.value === "price-asc") list.sort((a, b) => a.price - b.price);
            if (e.target.value === "price-desc") list.sort((a, b) => b.price - a.price);
            renderCards(list);
          });

          const clearCartBtn = document.getElementById('clearCart');
          if (clearCartBtn) clearCartBtn.addEventListener('click', () => { cart = {}; updateCartUI(); });

          const checkoutBtn = document.getElementById('checkout');
          if (checkoutBtn) checkoutBtn.addEventListener('click', () => alert('Demo: thanh toán'));
        }, 50);
        loadProducts();
      `;
      this.appendChild(script);
    }
  }
  customElements.define('product-grid', ProductGrid);