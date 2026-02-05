(function () {
  var theme = 'dark';
  try {
    var stored = null;
    var raw = localStorage.getItem('global');
    if (raw) {
      try {
        var data = JSON.parse(raw);
        if (data.theme && data.theme.value) stored = data.theme.value;
      } catch (e2) {}
    }
    if (stored == null) stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') theme = stored;
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches)
      theme = 'light';
  } catch (e) {}
  document.documentElement.setAttribute('data-theme', theme);
})();
