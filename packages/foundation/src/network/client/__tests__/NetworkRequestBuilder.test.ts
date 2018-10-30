import { NETWORK_VIA } from '../../network';
import NetworkManager from '../../NetworkManager';
import { HttpRequest } from '../http';
import { SocketRequest } from '../socket';
import NetworkRequestBuilder from '../NetworkRequestBuilder';

const builder = new NetworkRequestBuilder();
builder.setNetworkManager(NetworkManager.defaultInstance);

describe('NetworkRequestBuilder', () => {
  it('should return SocketRequest when via socket', () => {
    const request = builder.setVia(NETWORK_VIA.SOCKET).build();
    expect(request).toBeInstanceOf(SocketRequest);
  });

  it('should return SocketRequest when via http', () => {
    const request = builder.setVia(NETWORK_VIA.HTTP).build();
    expect(request).toBeInstanceOf(HttpRequest);
  });
  it('should return SocketRequest when via all and getAvailableClientType return socket', () => {
    NetworkManager.defaultInstance.clientManager.getAvailableClientType = jest
      .fn()
      .mockReturnValueOnce(NETWORK_VIA.SOCKET);
    const request = builder.setVia(NETWORK_VIA.ALL).build();
    expect(request).toBeInstanceOf(SocketRequest);
  });
  it('should return SocketRequest when via all and getAvailableClientType return http', () => {
    NetworkManager.defaultInstance.clientManager.getAvailableClientType = jest
      .fn()
      .mockReturnValueOnce(NETWORK_VIA.HTTP);
    const request = builder.setVia(NETWORK_VIA.ALL).build();
    expect(request).toBeInstanceOf(HttpRequest);
  });
});
