(() => {
  if (window.top === window.self) return;
  if (new URLSearchParams(window.location.search).get('embedded') !== '1') return;

  document.documentElement.classList.add('ai-engineering-embedded');
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = new URL('embed-shell.css', document.currentScript.src).href;
  document.head.append(stylesheet);
})();
