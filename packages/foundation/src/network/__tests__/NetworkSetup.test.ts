import NetworkSetup from '../NetworkSetup';
import OAuthTokenHandler from '../OAuthTokenHandler';
import { fakeHandleType } from './utils';
import NetworkManager from '../NetworkManager';
import OAuthTokenManager from '../OAuthTokenManager';

const networkManager = new NetworkManager(new OAuthTokenManager());

jest.mock('../OAuthTokenHandler');
describe('NetworkSetup', () => {
  describe('setup', () => {
    it('should call OAuthTokenHandler', () => {
      const spy = jest.spyOn(networkManager, 'buildNetworkRequestBaseHandler');
      NetworkSetup.setup(fakeHandleType, networkManager);
      expect(spy).toBeCalled();
      expect(OAuthTokenHandler).toBeCalled();
    });
  });
});
