const darkToggle = document.getElementById('darkToggle');
// initialize from saved preference (localStorage)
if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark');

function setThemeUI(){
  const isDark = document.body.classList.contains('dark');
  darkToggle.textContent = isDark ? 'Light' : 'Dark';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

darkToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  setThemeUI();
});

// set initial label
setThemeUI();