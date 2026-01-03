import { getBrands } from '../API/brandApi.js';

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('brand-sections');
  if (!container) return;

  try {
    const brands = await getBrands(); // lấy từ DB

    brands.forEach(brand => {
      const grid = document.createElement('product-grid');

      grid.setAttribute('mode', 'home');
      grid.setAttribute('brand-id', brand.brandId);
      grid.setAttribute('title', `${brand.brandName} nổi bật`);
      grid.setAttribute('limit', '4'); // mỗi brand tối đa 4 sp

      container.appendChild(grid);
    });

  } catch (err) {
    console.error('Load brands failed', err);
  }
});
