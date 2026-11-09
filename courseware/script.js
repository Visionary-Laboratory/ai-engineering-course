(() => {
  const toast = document.querySelector('.toast');
  let timer;
  function show(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(timer);
    timer = setTimeout(() => toast.classList.remove('show'), 3200);
  }
  document.querySelectorAll('[data-coming-soon]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      show('本讲课程讲义未上传，暂不能阅读或演示。');
    });
  });
  document.querySelectorAll('[data-course-notes]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      show('课程讲义暂未上传。');
    });
  });
  document.querySelectorAll('[data-missing]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      show('本讲课件尚未上传，暂不能预览或下载。');
    });
  });
  document.querySelectorAll('[data-missing-note]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      show('课程讲义暂未上传。');
    });
  });
  const menuButton = document.querySelector('.mobile-menu');
  const sidebar = document.querySelector('.sidebar');
  const nav = document.querySelector('.header-nav');
  menuButton?.addEventListener('click', () => {
    const open = !sidebar?.classList.contains('open');
    sidebar?.classList.toggle('open', open);
    nav?.classList.toggle('open', open);
    menuButton.setAttribute('aria-expanded', String(open));
  });
  document.querySelectorAll('.sidebar a[href^="#"]').forEach((link) => link.addEventListener('click', () => sidebar?.classList.remove('open')));
  document.querySelectorAll('.pdf-action, .download-buttons a').forEach((link) => {
    link.addEventListener('error', () => show('PDF 尚未上传，请将文件放入 pdf/ 文件夹。'));
  });
})();
