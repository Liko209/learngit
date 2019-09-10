import {
  OAuthTokenHandler,
  NETWORK_METHOD,
  NetworkRequestBuilder,
} from 'foundation/network';
import HandleByUpload from '../HandleByUpload';

const handler = new OAuthTokenHandler(HandleByUpload, null);

// jest.mock('../../api');
const postRequest = () => {
  return new NetworkRequestBuilder()
    .setPath('/')
    .setData({
      username: 'test',
    })
    .setParams({
      password: 'aaa',
    })
    .setHeaders({
      tk: 'sdfsdfadfss',
    })
    .setMethod(NETWORK_METHOD.POST)
    .setAuthfree(true)
    .setRequestConfig({})
    .build();
};
describe('HandleByUpload', () => {
  it('tokenRefreshable is true and generate basic according to Api.httpConfig', () => {
    expect(HandleByUpload.survivalModeSupportable).toBeTruthy();
  });
  it('should not add tk to headers if needAuth is false', () => {
    handler.isOAuthTokenAvailable = jest.fn().mockImplementation(() => true);
    handler.accessToken = jest.fn().mockImplementation(() => 'token');
    const decoration = HandleByUpload.requestDecoration(handler);
    const request = postRequest();
    request.needAuth = jest.fn().mockImplementation(() => false);
    decoration(request);
    expect(request.params && request.params.tk).toBeUndefined();
    expect(request.headers.Authorization).toBeUndefined();
    expect(request).toEqual(request);
  });
  it('should add tk to headers if needAuth is true ', () => {
    handler.isOAuthTokenAvailable = jest.fn().mockImplementation(() => true);
    handler.accessToken = jest.fn().mockImplementation(() => 'token');
    const decoration = HandleByUpload.requestDecoration(handler);
    const request = postRequest();
    const path = request.path;
    request.needAuth = jest.fn().mockImplementation(() => true);
    decoration(request);
    expect(request.params && request.params.tk).toBeUndefined();
    expect(request.path).toEqual(`${path}?tk=token`);
  });
  it('should not add tk to headers if isOAuthTokenAvailable is false ', () => {
    handler.isOAuthTokenAvailable = jest.fn().mockImplementation(() => false);
    handler.accessToken = jest.fn().mockImplementation(() => 'token');
    const decoration = HandleByUpload.requestDecoration(handler);
    const request = postRequest();
    const path = request.path;
    request.needAuth = jest.fn().mockImplementation(() => true);
    decoration(request);
    expect(request.params && request.params.tk).toBeUndefined();
    expect(request.path).toEqual(path);
    expect(request).toEqual(request);
  });
  it('should not add tk to params if isOAuthTokenAvailable is false ', () => {
    const decoration = HandleByUpload.requestDecoration(null);
    const request = postRequest();
    request.needAuth = jest.fn().mockImplementation(() => true);
    expect(decoration).toThrow();
  });
});
// import _ from 'lodash';

// const HandleByUpload = new class extends AbstractHandleType {
//   survivalModeSupportable = true;
//   requestDecoration(tokenHandler: ITokenHandler) {
//     const handler = tokenHandler as OAuthTokenHandler;
//     return (request: IRequest) => {
//       if (request.needAuth()) {
//         if (_.isEmpty(tokenHandler)) {
//           throw new Error('token handler can not be null.');
//         }
//         if (handler.isOAuthTokenAvailable()) {
//           request.params = {
//             ...request.params,
//             tk: handler.accessToken()
//           };
//         }
//       }
//       return request;
//     };
//   }
// }();

// export default HandleByUpload;
