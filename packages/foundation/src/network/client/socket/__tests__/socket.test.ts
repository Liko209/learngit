import Socket from '../Socket';
import { NETWORK_VIA } from '../../../network';
import NetworkRequestBuilder from '../../NetworkRequestBuilder';
import { SocketClient } from '../SocketIOClient';
import { getFakeClient } from '../../../__tests__/utils';
import { NetworkRequestExecutor } from '../../../NetworkRequestExecutor';

const getFakeSocketRequest = () => {
  const request = new NetworkRequestBuilder().setVia(NETWORK_VIA.SOCKET);
  return request;
};

const getFakeExecutor = () => {
  return new NetworkRequestExecutor(getFakeSocketRequest(), getFakeClient());
};
const socketRequestFn = jest.fn().mockReturnValue(
  new Promise((resolve, reject) => {
    resolve();
  }),
);
const socket = new Socket();
describe('socket', () => {
  describe('request', () => {
    it.skip('should set a request to tasks', async () => {
      const request = getFakeSocketRequest();
      SocketClient.get = jest.fn().mockReturnValue({
        request: socketRequestFn,
      });
      await socket.request(request, getFakeExecutor());
      expect(socket.tasks[request.id]).toEqual(request);
    });
  });
});
