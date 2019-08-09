/*
 * @Author: Paynter Chen
 * @Date: 2019-08-09 10:39:18
 * Copyright © RingCentral. All rights reserved.
 */

enum MessageType {
  MESSAGE,
  ERROR,
}

type EventMessage<T> = {
  channel: string;
  id: number;
  data: T;
  type: MessageType;
};

export function createWorker(Worker: { new (): Worker }) {
  return new Worker();
}

export function workerClientAdapter<T extends object>(worker: Worker): T {
  let index = 0;
  const proxy: any = new Proxy(
    {},
    {
      get: (target, key) => {
        return (...args: any[]) =>
          new Promise((resolve, reject) => {
            index += 1;
            const id = index;
            const onMessage = (ev: any) => {
              const eventMessage = ev.data as EventMessage<T>;
              if (eventMessage.channel === key && eventMessage.id === id) {
                worker.removeEventListener('message', onMessage);
                if (eventMessage.type === MessageType.ERROR) {
                  reject(eventMessage.data);
                } else {
                  resolve(eventMessage.data);
                }
              }
            };
            worker.addEventListener('message', onMessage);
            worker.postMessage({
              id,
              channel: key,
              data: args,
            });
          });
      },
    },
  );
  return proxy;
}

export function workerServerAdapter<T>(
  server: { [key in keyof T]: any },
): { new (): Worker } {
  const workerContext: Worker = global as any;
  workerContext.addEventListener('message', ev => {
    const eventMessage = ev.data as EventMessage<any>;
    const api = server[eventMessage.channel];
    if (api) {
      let tempResult: any;
      try {
        tempResult = api(...eventMessage.data);
      } catch (error) {
        workerContext.postMessage({
          ...eventMessage,
          type: MessageType.ERROR,
          data: { message: error.message, stack: error.stack },
        });
      }
      if (tempResult && tempResult.then) {
        tempResult
          .then((result: any) => {
            workerContext.postMessage({
              ...eventMessage,
              data: result,
            });
          })
          .catch((error: any) => {
            workerContext.postMessage({
              ...eventMessage,
              type: MessageType.ERROR,
              data: { message: error.message, stack: error.stack },
            });
          });
      } else {
        workerContext.postMessage({
          ...eventMessage,
          data: tempResult,
        });
      }
    }
  });
  return null as any;
}
