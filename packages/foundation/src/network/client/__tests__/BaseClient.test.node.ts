import BaseClient from '../BaseClient';
import { getFakeRequest } from '../../__tests__/utils';

const client = new class extends BaseClient {}();
describe('BaseClient', () => {
  describe('cancelRequest', () => {
    it('should call delete', () => {
      const spy = jest.spyOn(client.tasks, 'delete');
      client.cancelRequest(getFakeRequest());
      expect(spy).toHaveBeenCalled();
    });

    it('isNetworkReachable always return true', () => {
      expect(client.isNetworkReachable()).toBeTruthy();
    });
  });
});
