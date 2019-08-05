/*
 * @Author: steven.zhuang
 * @Date: 2019-07-26 16:19:08
 * Copyright © RingCentral. All rights reserved.
 */

const clientStatus = {};
const logTag = '[SW][Upgrade]';

const getAllClients = async () => {
  const clients = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true,
  });
  return clients;
};
const getAllControlledClients = async () => {
  const clients = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: false,
  });
  return clients;
};

const sendToClient = (client, msg) => {
  const data = JSON.stringify(msg);
  client.postMessage(data);
};
const sendSiblingCanReloadToClient = (client, status, siblingCount, reason) => {
  sendToClient(client, {
    type: 'siblingCanReload',
    status,
    siblingCount,
    reason,
  });
};

self.addEventListener('message', async ev => {
  if (ev.data && ev.data.type === 'checkSiblingCanReload') {
    const srcClient = ev.source;
    clientStatus[srcClient.id] = undefined;
    console.log(`${logTag}[checkSiblingCanReload] srcID: ${srcClient.id}`);

    ev.waitUntil(
      getAllClients().then(allClients => {
        const siblingClients = allClients.filter(client => {
          return client.id !== srcClient.id;
        });
        console.log(
          `${logTag}[checkSiblingCanReload] siblingClients count: ${
            siblingClients.length
          }`,
        );

        let status = true;
        if (siblingClients.length > 0) {
          const hasfocused = siblingClients.some(client => {
            return client.focused;
          });

          status = !hasfocused;
        }
        sendSiblingCanReloadToClient(srcClient, status, siblingClients.length);
      }),
    );
  }
});
