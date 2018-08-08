import Manager from '../Manager';
import { NETWORK_VIA } from '../../network';
const manager = new Manager();
describe('Manager', () => {
  describe('getApiClient', () => {
    it('should get http client', () => {
      expect(manager.getApiClient(NETWORK_VIA.HTTP)).toEqual(
        manager.httpClient
      );

      expect(manager.getApiClient(NETWORK_VIA.SOCKET)).toEqual(
        manager.socketClient
      );
    });
  });
});
