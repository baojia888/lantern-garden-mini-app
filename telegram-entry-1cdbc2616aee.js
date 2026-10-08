/* Deployment-only bridge. The ordinary game build does not import this file. */
(() => {
  const app = window.Telegram?.WebApp;
  if (!app || app.platform === 'unknown') return;
  const root = document.documentElement;
  root.dataset.telegram = 'true';
  const fit = () => {
    const safe = app.safeAreaInset ?? {};
    const content = app.contentSafeAreaInset ?? {};
    for (const edge of ['top','right','bottom','left']) {
      root.style.setProperty(`--telegram-inset-${edge}`, `${Math.max(0,safe[edge] ?? 0) + Math.max(0,content[edge] ?? 0)}px`);
    }
  };
  app.expand();
  app.setHeaderColor('#101615');
  app.setBackgroundColor('#101615');
  fit();
  app.onEvent('safeAreaChanged', fit);
  app.onEvent('contentSafeAreaChanged', fit);
  app.onEvent('viewportChanged', fit);
  const style = document.createElement('style');
  style.textContent = `html[data-telegram] body { padding: var(--telegram-inset-top) var(--telegram-inset-right) var(--telegram-inset-bottom) var(--telegram-inset-left); }
    html[data-telegram] :is(.game,.prelude,.puzzle,.expansion,.expansion-intro,.expansion-game,.area-preview) { min-height: calc(100svh - var(--telegram-inset-top) - var(--telegram-inset-bottom)); }`;
  document.head.append(style);
  // The existing quiet recovery control is also a valid initial screen.
  const ready = () => {
    if (document.body.dataset.journeyReady !== 'true' && document.getElementById('journey-boot-error')?.hidden !== false) return;
    observer.disconnect();
    app.ready();
  };
  const observer = new MutationObserver(ready);
  observer.observe(document.body, {attributes:true, subtree:true, attributeFilter:['data-journey-ready','hidden']});
  ready();
})();
