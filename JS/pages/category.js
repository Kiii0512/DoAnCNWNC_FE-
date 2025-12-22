class CategoryPage extends HTMLElement {
  connectedCallback() {
    const params = new URLSearchParams(location.search);
    const category = params.get("cate");

    this.innerHTML = `
      <product-grid ${category ? `category="${category}"` : ""}></product-grid>
    `;
  }
}

customElements.define("category-page", CategoryPage);