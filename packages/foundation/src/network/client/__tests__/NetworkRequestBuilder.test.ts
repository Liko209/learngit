import { NETWORK_VIA } from '../../network';
import NetworkManager from '../../NetworkManager';
import { HttpRequest } from '../http';
import { SocketRequest } from '../socket';
import NetworkRequestBuilder from '../NetworkRequestBuilder';
import OAuthTokenManager from '../../OAuthTokenManager';

const builder = new NetworkRequestBuilder();
const networkManager = new NetworkManager(new OAuthTokenManager());
builder.setNetworkManager(networkManager);

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
    networkManager.clientManager.getAvailableClientType = jest
      .fn()
      .mockReturnValueOnce(NETWORK_VIA.SOCKET);
    const request = builder.setVia(NETWORK_VIA.ALL).build();
    expect(request).toBeInstanceOf(SocketRequest);
  });
  it('should return SocketRequest when via all and getAvailableClientType return http', () => {
    networkManager.clientManager.getAvailableClientType = jest
      .fn()
      .mockReturnValueOnce(NETWORK_VIA.HTTP);
    const request = builder.setVia(NETWORK_VIA.ALL).build();
    expect(request).toBeInstanceOf(HttpRequest);
  });
});
