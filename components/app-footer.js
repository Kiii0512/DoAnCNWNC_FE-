// components/app-footer.js
class AppFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="footer">
        <div class="container">
          © 2025 Electronic Store
        </div>
      </footer>
    `;
  }
}

customElements.define('app-footer', AppFooter);