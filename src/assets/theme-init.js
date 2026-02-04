(function () {
  var theme = 'dark';
  try {
    var stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') theme = stored;
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches)
      theme = 'light';
  } catch (e) {}
  document.documentElement.setAttribute('data-theme', theme);
})();
