import { SWNotification } from '../SWNotification';

describe('SWNotification', () => {
  describe('constructor()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('should call _subscribeWorkerMessage when isSupported is true', () => {
      jest.spyOn(SWNotification.prototype, 'isSupported').mockReturnValue(true);
      jest
        .spyOn(SWNotification.prototype, '_subscribeWorkerMessage')
        .mockImplementation();
      const swNotification = new SWNotification();
      expect(SWNotification.prototype._subscribeWorkerMessage).toBeCalled();
    });
    it('should not call _subscribeWorkerMessage when isSupported is false', () => {
      jest
        .spyOn(SWNotification.prototype, 'isSupported')
        .mockReturnValue(false);
      jest
        .spyOn(SWNotification.prototype, '_subscribeWorkerMessage')
        .mockImplementation();
      const swNotification = new SWNotification();
      expect(SWNotification.prototype._subscribeWorkerMessage).not.toBeCalled();
    });
  });
});
