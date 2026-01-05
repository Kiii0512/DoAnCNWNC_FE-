export function showToast(msg, ms = 1400){
  const t = document.getElementById('toast');
  if(!t) return;

  t.textContent = msg;
  t.classList.add('show');

  clearTimeout(t._t);
  t._t = setTimeout(() => {
    t.classList.remove('show');
  }, ms);
}
