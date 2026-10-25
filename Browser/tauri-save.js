'use strict';
// This adapter carries only save transport. All game decisions remain in engine.js.
(() => {
  if (!window.__TAURI__?.core?.invoke) return;
  window.spacetraderStandalone = true;
  window.spacetraderStorageRequest = async (path, options = {}) => {
    const response = await window.__TAURI__.core.invoke('voyage_storage', {
      request: { path, method: options.method || 'GET', body: options.body || null }
    });
    return { ok: response.status >= 200 && response.status < 300,
      status: response.status, json: async () => response.body };
  };
})();
