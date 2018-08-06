import NetworkSetup from '../NetworkSetup';
import OAuthTokenHandler from '../OAuthTokenHandler';
import { fakeHandleType } from './utils';
import NetworkManager from '../NetworkManager';
jest.mock('../OAuthTokenHandler');
describe('NetworkSetup', () => {
  describe('setup', () => {
    it('should call OAuthTokenHandler', () => {
      const spy = jest.spyOn(
        NetworkManager.Instance,
        'initNetworkRequestBaseHandler',
      );
      NetworkSetup.SETUP([fakeHandleType]);
      expect(spy).toBeCalled();
      expect(OAuthTokenHandler).toBeCalled();
    });
  });
});
