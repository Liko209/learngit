import { PRESENCE } from 'sdk/module/presence/constant';
import { isDND } from '../utils';
import * as utils from '@/store/utils';

describe('utils', () => {
  describe('isDND()', () => {
    beforeAll(() => {
      jest
        .spyOn(utils, 'getEntity')
        .mockReturnValue({ deactivated: false, presence: PRESENCE.DND });
      jest.spyOn(utils, 'getGlobalValue').mockReturnValue(1);
    });
    it('should return true if current is DND', () => {
      expect(isDND()).toBeTruthy();
    });
    it('should return false if current is not DND', () => {
      jest
        .spyOn(utils, 'getEntity')
        .mockReturnValueOnce({ deactivated: false, presence: PRESENCE.ONLINE });
      expect(isDND()).toBeTruthy();
    });
  });
});
