/* Deployment-only bridge. The ordinary game build does not import this file. */
(() => {
  const app = window.Telegram?.WebApp;
  if (!app || app.platform === 'unknown') return;
  const root = document.documentElement;
  root.dataset.telegram = 'true';
  const fit = () => {
    root.dataset.telegramFullscreen = String(Boolean(app.isFullscreen));
    const safe = app.safeAreaInset ?? {};
    const content = app.contentSafeAreaInset ?? {};
    for (const edge of ['top','right','bottom','left']) {
      root.style.setProperty(`--telegram-inset-${edge}`, `${Math.max(0,safe[edge] ?? 0) + Math.max(0,content[edge] ?? 0)}px`);
    }
    // Fullscreen includes the status area AND Telegram's floating controls.
    // Insets are additive (the iOS client reports the control row separately).
    // Use the last settled host height, not a padded 100vh document.
    const height = app.viewportStableHeight;
    if (Number.isFinite(height) && height > 1) {
      const browserHeight = window.innerHeight;
      const visibleHeight = Number.isFinite(browserHeight) && browserHeight > 1 ? Math.min(height, browserHeight) : height;
      root.style.setProperty('--telegram-height', `${visibleHeight}px`);
    }
  };
  app.expand();
  app.setHeaderColor('#101615');
  app.setBackgroundColor('#101615');
  // Expansion alone does not prevent Telegram's minimize/close swipe.
  if (app.isVersionAtLeast?.('7.7')) app.disableVerticalSwipes();
  if (app.isVersionAtLeast?.('8.0') && !app.isFullscreen) {
    try { app.requestFullscreen(); }
    catch { /* Client refusal keeps the expanded, playable layout. */ }
  }
  fit();
  app.onEvent('safeAreaChanged', fit);
  app.onEvent('contentSafeAreaChanged', fit);
  app.onEvent('viewportChanged', fit);
  app.onEvent('fullscreenChanged', fit);
  app.onEvent('fullscreenFailed', fit);
  window.addEventListener('resize', fit);
  const style = document.createElement('style');
  style.textContent = `
    html[data-telegram] {
      --telegram-height: 100svh;
      --play-height: calc(var(--telegram-height) - var(--telegram-inset-top) - var(--telegram-inset-bottom));
      --play-width: calc(100vw - var(--telegram-inset-left) - var(--telegram-inset-right));
      overflow: hidden; overscroll-behavior: none;
    }
    html[data-telegram] body { position: fixed; inset: 0; width: 100%; height: 100%; padding: 0; min-width: 0; overflow: hidden; overscroll-behavior: none; }
    html[data-telegram] :is(.game,.expansion,.area-preview) { position: absolute; inset: 0; width: 100%; height: 100%; min-height: 0; }
    html[data-telegram] .area-preview { padding: calc(var(--telegram-inset-top) + 36px) calc(var(--telegram-inset-right) + 36px) calc(var(--telegram-inset-bottom) + 36px) calc(var(--telegram-inset-left) + 36px); }
    html[data-telegram] :is(.prelude,.puzzle,.expansion-intro,.expansion-game,.journey-dawn) {
      position: absolute; top: var(--telegram-inset-top); left: var(--telegram-inset-left);
      width: var(--play-width); height: var(--play-height); min-height: 0;
    }
    html[data-telegram] :is(.puzzle,.expansion-game) { --field-width: calc(var(--play-width) - 40px); }
    html[data-telegram] :is(.help-dialog,.expansion-menu) {
      top: var(--telegram-inset-top); left: var(--telegram-inset-left); width: var(--play-width); height: var(--play-height);
      max-height: var(--play-height); margin: 0; overflow: hidden;
    }
    html[data-telegram] :is(.help-dialog .menu-shell,.expansion-menu-shell) { height: min(690px, calc(var(--play-height) - 24px)); max-height: calc(var(--play-height) - 24px); }
    html[data-telegram] :is(.erase-dialog,.journey-transfer-dialog,.graphics-check) {
      inset: var(--telegram-inset-top) var(--telegram-inset-right) var(--telegram-inset-bottom) var(--telegram-inset-left);
      max-width: calc(var(--play-width) - 24px); max-height: calc(var(--play-height) - 24px); overflow-y: auto;
    }
    html[data-telegram] .graphics-check-shell { max-height: calc(var(--play-height) - 78px); }
    html[data-telegram] .journey-waiting { bottom: calc(var(--telegram-inset-bottom) + 22px); }
    @media (max-height: 450px) and (min-width: 601px) {
      html[data-telegram] :is(.puzzle,.expansion-game) { --field-width: calc(var(--play-width) - 340px); }
      html[data-telegram] :is(#help,#expansion-menu-button) { position: absolute; }
    }`;
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
