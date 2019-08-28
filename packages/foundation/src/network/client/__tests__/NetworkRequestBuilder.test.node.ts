import { NETWORK_VIA, IRequest, NETWORK_METHOD } from '../../network';
import NetworkManager from '../../NetworkManager';
import { HttpRequest } from '../http';
import { SocketRequest } from '../socket';
import NetworkRequestBuilder from '../NetworkRequestBuilder';
import OAuthTokenManager from '../../OAuthTokenManager';

const builder = new NetworkRequestBuilder();
const networkManager = new NetworkManager(new OAuthTokenManager());
builder.setNetworkManager(networkManager);

describe('NetworkRequestBuilder', () => {
  function clearMocks() {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  }

  beforeEach(() => {
    clearMocks();
  });

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

  it('should return HttpRequest when build via ALL and set via HTTP', () => {
    const request = builder.setVia(NETWORK_VIA.ALL).build(NETWORK_VIA.HTTP);
    expect(request).toBeInstanceOf(HttpRequest);
  });

  it('should return SocketRequest when build via HTTP and set via SOCKET', () => {
    const request = builder.setVia(NETWORK_VIA.ALL).build(NETWORK_VIA.SOCKET);
    expect(request).toBeInstanceOf(SocketRequest);
  });

  it('should set ignoreNetwork correctly', () => {
    builder.setIgnoreNetwork(false);
    expect(builder.ignoreNetwork).toBeFalsy();
  });

  describe('options()', () => {
    const request: IRequest = {
      host: 'host',
      path: '/',
      method: NETWORK_METHOD.GET,
      data: {},
      headers: {},
      authFree: true,
      ignoreNetwork: true,
    };
    builder.options(request);
    expect(builder.host).toEqual(request.host);
    expect(builder.path).toEqual(request.path);
    expect(builder.method).toEqual(request.method);
    expect(builder.data).toEqual(request.data);
    expect(builder.headers).toEqual(request.headers);
    expect(builder.authFree).toEqual(request.authFree);
    expect(builder.ignoreNetwork).toEqual(request.ignoreNetwork);
  });
});
