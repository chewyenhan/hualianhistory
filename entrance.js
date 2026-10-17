(() => {
  const root = document.documentElement;
  const overlay = document.querySelector('#entrance');
  const skip = document.querySelector('#entrance-skip');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const replay = document.createElement('button');
  replay.type = 'button';
  replay.className = 'entry-replay';
  replay.textContent = '重播入场动画 ↻';
  document.querySelector('footer').append(replay);
  let timer;
  let frame;
  let running = false;
  let returnFocus;
  const page = [document.querySelector('header'), document.querySelector('main'), document.querySelector('.skip')];
  function finish() {
    clearTimeout(timer);
    cancelAnimationFrame(frame);
    const focusInOverlay = overlay.contains(document.activeElement);
    running = false;
    root.removeAttribute('data-enter');
    page.forEach(node => { node.inert = false; });
    try { sessionStorage.setItem('hualian-entry-seen', '1'); } catch (error) {}
    if (focusInOverlay) (returnFocus || document.querySelector('.brand')).focus({preventScroll:true});
  }
  function start(manual = false) {
    if (reduced.matches) { finish(); return; }
    if (running) return;
    running = true;
    returnFocus = manual ? replay : null;
    if (manual) window.scrollTo({top:0,behavior:'instant'});
    root.dataset.enter = 'pending';
    page.forEach(node => { node.inert = true; });
    frame = requestAnimationFrame(() => {
      root.dataset.enter = 'running';
      if (manual) skip.focus({preventScroll:true});
      timer = setTimeout(finish, 2350);
    });
  }
  skip.addEventListener('click', finish);
  overlay.addEventListener('keydown', event => {
    if (event.key === 'Escape') finish();
    if (event.key === 'Tab') { event.preventDefault(); skip.focus(); }
  });
  replay.addEventListener('click', () => start(true));
  reduced.addEventListener('change', () => { replay.hidden = reduced.matches; if(reduced.matches) finish(); });
  window.addEventListener('pagehide', finish);
  replay.hidden = reduced.matches;
  if (root.hasAttribute('data-enter')) start();
})();
