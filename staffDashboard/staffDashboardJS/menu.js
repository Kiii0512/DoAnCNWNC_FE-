/* Menu scroll behaviour */
(function(){
  const wrap = document.getElementById('scrollWrap');
  const inner = document.getElementById('scrollInner');
  const left = document.getElementById('leftArrow');
  const right = document.getElementById('rightArrow');

  function updateArrows(){
    if(!wrap || !inner) return;
    const maxScroll = inner.scrollWidth - wrap.clientWidth;
    if (maxScroll <= 2) {
      left.hidden = true; right.hidden = true; left.setAttribute('aria-hidden','true'); right.setAttribute('aria-hidden','true');
      return;
    }
    left.hidden = wrap.scrollLeft <= 4;
    right.hidden = wrap.scrollLeft >= maxScroll - 4;
    left.setAttribute('aria-hidden', left.hidden ? 'true' : 'false');
    right.setAttribute('aria-hidden', right.hidden ? 'true' : 'false');
  }

  function doScroll(dir){
    if(!wrap || !inner) return;
    const step = Math.round(wrap.clientWidth * 0.7) || 200;
    const target = dir === 'right' ? Math.min(inner.scrollWidth - wrap.clientWidth, wrap.scrollLeft + step) : Math.max(0, wrap.scrollLeft - step);
    smoothScrollTo(wrap, target, 300);
  }

  function smoothScrollTo(elem, to, duration) {
    const start = elem.scrollLeft;
    const change = to - start;
    const startTime = performance.now();
    function animate(time){
      const t = Math.min(1, (time - startTime) / duration);
      const eased = t<0.5 ? 2*t*t : -1 + (4 - 2*t)*t;
      elem.scrollLeft = Math.round(start + change * eased);
      if (t < 1) requestAnimationFrame(animate); else updateArrows();
    }
    requestAnimationFrame(animate);
  }

  if(!right || !left || !wrap || !inner) return;

  right.addEventListener('click', (e)=> { e.stopPropagation(); doScroll('right'); });
  left.addEventListener('click', (e)=> { e.stopPropagation(); doScroll('left'); });

  right.addEventListener('keydown', e=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); right.click(); }});
  left.addEventListener('keydown', e=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); left.click(); }});

  window.addEventListener('resize', updateArrows);
  wrap.addEventListener('scroll', () => { window.requestAnimationFrame(updateArrows); });

  let startX = 0, isTouching = false;
  wrap.addEventListener('touchstart', e=>{ isTouching=true; startX = e.touches[0].clientX; });
  wrap.addEventListener('touchmove', e=>{ if(!isTouching) return; const dx = startX - e.touches[0].clientX; wrap.scrollLeft += dx; startX = e.touches[0].clientX; });
  wrap.addEventListener('touchend', ()=>{ isTouching=false; updateArrows(); });

  const menuItems = Array.from(document.querySelectorAll('.menu-item'));

  function setActiveElement(el){
    menuItems.forEach(x=>{ x.classList.remove('active'); x.removeAttribute('aria-current'); });
    if(!el) return;
    el.classList.add('active');
    el.setAttribute('aria-current','page');
    const wrapRect = wrap.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    if(elRect.left < wrapRect.left || elRect.right > wrapRect.right){
      const target = Math.max(0, el.offsetLeft - Math.round(wrap.clientWidth * 0.14));
      smoothScrollTo(wrap, target, 300);
    }
    updateArrows();
  }

  menuItems.forEach(a=>{
    a.setAttribute('tabindex','0');
    a.addEventListener('click', (e)=>{
      const href = a.getAttribute('href') || '';
      if(href.startsWith('#')){ location.hash = href; }
      setActiveElement(a);
    });
    a.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); a.click(); } });
  });

  function setActiveFromLocation(){
    const hash = location.hash || '';
    let sel = null;
    if(hash){ sel = document.querySelector(`.menu-item[href="${hash}"]`) || document.querySelector(`.menu-item[data-route="${hash.replace('#','')}"]`); }
    if(!sel) sel = document.querySelector('.menu-item[data-route="orders"]')
         || document.querySelector('.menu-item[href$="adminOrder.html"]')
         || document.querySelector('.menu-item'); // default to first
    setActiveElement(sel);
  }

  window.addEventListener('hashchange', setActiveFromLocation);
  window.addEventListener('load', ()=>{ setActiveFromLocation(); updateArrows(); });
  setTimeout(()=>{ setActiveFromLocation(); updateArrows(); }, 160);
})();
