import NetworkRequestBuilder from '../NetworkRequestBuilder';
import { NETWORK_VIA } from '../../network';
import SocketRequest from '../socket/SocketRequest';
import Request from '../http/Request';
import NetworkManager from '../../NetworkManager';
const builder = new NetworkRequestBuilder();
describe('NetworkRequestBuilder', () => {
  it('should return SocketRequest when via socket', () => {
    const request = builder.setVia(NETWORK_VIA.SOCKET).build();
    expect(request).toBeInstanceOf(SocketRequest);
  });

  it('should return SocketRequest when via http', () => {
    const request = builder.setVia(NETWORK_VIA.HTTP).build();
    expect(request).toBeInstanceOf(Request);
  });
  it('should return SocketRequest when via all and getAvailableClientType return socket', () => {
    NetworkManager.Instance.clientManager.getAvailableClientType = jest
      .fn()
      .mockReturnValueOnce(NETWORK_VIA.SOCKET);
    const request = builder.setVia(NETWORK_VIA.ALL).build();
    expect(request).toBeInstanceOf(SocketRequest);
  });
  it('should return SocketRequest when via all and getAvailableClientType return http', () => {
    NetworkManager.Instance.clientManager.getAvailableClientType = jest
      .fn()
      .mockReturnValueOnce(NETWORK_VIA.HTTP);
    const request = builder.setVia(NETWORK_VIA.ALL).build();
    expect(request).toBeInstanceOf(Request);
  });
});
