const channel = new BroadcastChannel('sw-notification-channel');
channel.addEventListener('message', event => {
  getTargetedClient().then((targetClient) => {
    if (targetClient) {
      targetClient.focus();
      targetClient.postMessage(
        JSON.stringify({
          id: event.data.id,
          scope: event.data.scope,
          action: event.data.action
        }),
      );
      channel.postMessage({ meesageId: event.data.id });
    }
  });
});
