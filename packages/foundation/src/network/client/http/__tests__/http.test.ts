import Http from '../Http';
import { getFakeRequest, getFakeExecutor } from '../../../__tests__/utils';

const http = new Http();

describe('Http client', () => {
  describe('request', () => {
    it('should set to tasks', () => {
      const request = getFakeRequest();
      http.request(request, getFakeExecutor());
      expect(http.tasks.get(request.id)).toEqual(request);
    });
  });
});
