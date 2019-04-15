self.onnotificationclose = async (event) => {
  const targetClient = await getTargetedClient();
  if (targetClient) {
    targetClient.postMessage(
      JSON.stringify({
        id: event.notification.data.id,
        action: 'close',
        scope: event.notification.data.scope,
      }),
    );
  }
};

self.onnotificationclick = async (event) => {
  event.notification.close();
  event.waitUntil(
    getTargetedClient().then((targetClient) => {
      if (targetClient) {
        targetClient.focus();
        targetClient.postMessage(
          JSON.stringify({
            id: event.notification.data.id,
            scope: event.notification.data.scope,
            action: event.action,
          }),
        );
      }
    }),
  );
};

const getTargetedClient = async () => {
  const clients = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true,
  });
  return clients[0];
};
