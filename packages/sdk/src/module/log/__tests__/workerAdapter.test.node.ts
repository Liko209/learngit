/*
 * @Author: Paynter Chen
 * @Date: 2019-08-10 11:12:10
 * Copyright © RingCentral. All rights reserved.
 */
import { workerClientAdapter, workerServerAdapter } from '../workerAdapter';
import { EventEmitter } from 'events';
import { spyOnTarget } from 'sdk/__tests__/utils';

class MockWorkerClient extends EventEmitter {
  public server: MockWorkerServer;

  addEventListener(channel: string, cb: any) {
    return this.on(channel, cb);
  }

  removeEventListener(channel: string, cb: any) {
    return this.off(channel, cb);
  }

  postMessage(message: any) {
    this.server.emit('message', { data: message });
  }
}

class MockWorkerServer extends EventEmitter {
  public client: EventEmitter;
  addEventListener(channel: string, cb: (...args: any) => void) {
    super.on(channel, (message: any) => {
      cb(message);
    });
  }
  postMessage(message: any) {
    this.client.emit('message', { data: message });
  }
}

function connect(server: MockWorkerServer, client: MockWorkerClient) {
  server.client = client;
  client.server = server;
}

describe('workerAdapter', () => {
  async function foo(text: string) {
    return `foo: ${text}`;
  }
  const workerImpl = {
    foo,
  };
  describe('workerClientAdapter()', () => {
    it('should workerServerAdapter work correctly with workerClientAdapter', async () => {
      const server = new MockWorkerServer();
      const client = new MockWorkerClient();
      connect(
        server,
        client,
      );
      spyOnTarget(server);
      spyOnTarget(client);
      workerServerAdapter(server, {
        foo,
      });
      expect(server.addEventListener).toHaveBeenCalledWith(
        'message',
        expect.anything(),
      );
      const worker = workerClientAdapter<typeof workerImpl>(
        (client as any) as Worker,
      );
      const result = await worker.foo('222');
      expect(result).toEqual('foo: 222');
    });
  });
});
