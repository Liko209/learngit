import { NOTIFICATION_PRIORITY } from '@/modules/notification/interface';
import { AbstractNotification } from '../agent/AbstractNotification';

jest.mock('@/common/isUserAgent', () => ({ isEdge: true }));
const mockedNotificationLow = {
  data: {
    id: 123,
    scope: 'message',
    priority: NOTIFICATION_PRIORITY.MESSAGE,
  },
};
const mockedNotificationHigh = {
  data: {
    id: 456,
    scope: 'incoming_call',
    priority: NOTIFICATION_PRIORITY.INCOMING_CALL,
  },
};

describe('AbstractNotification', () => {
  describe('handlePriority()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      AbstractNotification.prototype.close = jest.fn();
    });
    it('should close low priority notification when there is a high priority notification going to show', async () => {
      AbstractNotification.prototype.getNotifications = jest
        .fn()
        .mockReturnValue([mockedNotificationLow]);
      await AbstractNotification.prototype.handlePriority(
        mockedNotificationHigh,
      );
      expect(AbstractNotification.prototype.close).toBeCalledWith(
        'message',
        123,
      );
    });
    it('should not close high priority notification when there is a low priority notification going to show', async () => {
      AbstractNotification.prototype.getNotifications = jest
        .fn()
        .mockReturnValue([mockedNotificationHigh]);
      await AbstractNotification.prototype.handlePriority(
        mockedNotificationLow,
      );
      expect(AbstractNotification.prototype.close).not.toBeCalled();
    });
  });
});
