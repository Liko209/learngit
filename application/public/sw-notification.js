self.addEventListener('message', (event) => {
  self.sourceClient = event.source; //Only supports One-tab situation
});

self.onnotificationclose = (event) => {
  self.sourceClient.postMessage(
    JSON.stringify({
      id: event.notification.data.id,
      action: 'close',
      scope: event.notification.data.scope,
    }),
  );
};

self.onnotificationclick = (event) => {
  self.sourceClient.postMessage(
    JSON.stringify({
      id: event.notification.data.id,
      scope: event.notification.data.scope,
      action: event.action,
    }),
  );
  event.notification.close();
};
