const Api = jest.genMockFromModule('../api');
const { default: NetworkClient } = jest.genMockFromModule('../NetworkClient');

Api.glipNetworkClient = new NetworkClient();
Api.glip2NetworkClient = new NetworkClient();
Api.rcNetworkClient = new NetworkClient();
Api.uploadNetworkClient = new NetworkClient();
Api.httpConfig = {
  rc: { apiPlatformVersion: 'v1.x', clientId: 'rc_id', clientSecret: 'rc_secret' },
  glip2: { clientId: 'glip2_id', clientSecret: 'glip2_secret' }
};
Api.getDataById = jest.fn();
Api.postData = jest.fn();
Api.putDataById = jest.fn();

export default Api;
