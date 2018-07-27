import { OAuthTokenHandler, NETWORK_METHOD, NetworkRequestBuilder } from 'foundation';
jest.mock('foundation');
import HandleByUpload from '../HandleByUpload';
const handler = new OAuthTokenHandler(HandleByUpload, null);

jest.mock('../../api');
const postRequest = () => {
  return new NetworkRequestBuilder()
    .setPath('/')
    .setData({
      username: 'test'
    })
    .setParams({
      password: 'aaa'
    })
    .setHeaders({
      tk: 'sdfsdfadfss'
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
  it('should not add tk to params if needAuth is false', () => {
    handler.isOAuthTokenAvailable = jest.fn().mockImplementation(() => true);
    handler.accessToken = jest.fn().mockImplementation(() => 'token');
    const decoration = HandleByUpload.requestDecoration(handler);
    const request = postRequest();
    request.needAuth = jest.fn().mockImplementation(() => false);
    const decoratedRequest = decoration(request);
    expect(decoratedRequest.params.tk).toBeUndefined();
    expect(decoratedRequest).toEqual(request);
  });
  it('should add tk to params if needAuth is true ', () => {
    handler.isOAuthTokenAvailable = jest.fn().mockImplementation(() => true);
    handler.accessToken = jest.fn().mockImplementation(() => 'token');
    const decoration = HandleByUpload.requestDecoration(handler);
    const request = postRequest();
    request.needAuth = jest.fn().mockImplementation(() => true);
    const decoratedRequest = decoration(request);
    expect(decoratedRequest.params.tk).toBe('token');
  });
  it('should not add tk to params if isOAuthTokenAvailable is false ', () => {
    handler.isOAuthTokenAvailable = jest.fn().mockImplementation(() => false);
    handler.accessToken = jest.fn().mockImplementation(() => 'token');
    const decoration = HandleByUpload.requestDecoration(handler);
    const request = postRequest();
    request.needAuth = jest.fn().mockImplementation(() => true);
    const decoratedRequest = decoration(request);
    expect(request.params.tk).toBeUndefined();
    expect(decoratedRequest).toEqual(request);
  });
  it('should not add tk to params if isOAuthTokenAvailable is false ', () => {
    const decoration = HandleByUpload.requestDecoration(null);
    const request = postRequest();
    request.needAuth = jest.fn().mockImplementation(() => true);
    expect(decoration).toThrowError();
  });
});
// import _ from 'lodash';

// import { IRequest, OAuthTokenHandler, ITokenHandler, AbstractHandleType } from 'foundation';

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
