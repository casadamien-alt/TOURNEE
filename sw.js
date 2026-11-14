// Ma tournée — service minimal : il ne fait RIEN en arrière-plan.
// Il sert uniquement quand vous touchez la notification « Revenir à l'application » :
// il remet l'application au premier plan (sans la recharger). Aucune position, aucune donnée envoyée.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("notificationclick", e => {
  e.notification.close();
  if (e.action === "non") return;   // « Non » : on reste sur la navigation (téléphone sans Android Auto)
  e.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const w = wins.find(c => c.url.startsWith(self.registration.scope)) || wins[0];
    if (w){ await w.focus(); w.postMessage({ type: "retourEtape" }); return; }
    await self.clients.openWindow(self.registration.scope);
  })());
});
