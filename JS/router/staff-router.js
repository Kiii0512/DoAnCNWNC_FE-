// JS/router/staff-router.js

function loadRoute(route) {
  const app = document.querySelector('#app');
  if (!app) {
    console.error('❌ Không tìm thấy #app');
    return;
  }

  console.log('➡️ Route:', route);

  switch (route) {
    case 'order':
      app.innerHTML = '<order-page></order-page>';
      break;

    case 'feedback':
      app.innerHTML = '<feedback-page></feedback-page>';
      break;

    case 'report':
      app.innerHTML = '<report-page></report-page>';
      break;

    case 'product':
    default:
      app.innerHTML = '<product-page></product-page>';
  }
}

// 🔴 RẤT QUAN TRỌNG: chạy NGAY khi load trang
window.addEventListener('DOMContentLoaded', () => {
  loadRoute(location.hash.replace('#', '') || 'product');
});

// 🔴 BẮT hashchange
window.addEventListener('hashchange', () => {
  loadRoute(location.hash.replace('#', ''));
});
