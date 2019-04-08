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
  event.preventDefault();
  const targetClient = await getTargetedClient();
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
  event.notification.close();
};

const getTargetedClient = async () => {
  const clients = await self.clients.matchAll({
    type: 'window',
  });
  return clients[0];
};
