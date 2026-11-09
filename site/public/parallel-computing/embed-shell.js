if (window.top !== window.self) {
  document.documentElement.classList.add(
    'ai-engineering-embedded',
    'ai-engineering-embedded-compact',
  );
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = new URL('embed-shell.css', document.currentScript.src).href;
  document.head.append(stylesheet);
}
