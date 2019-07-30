import { testable, test } from 'shield';
import { PRESENCE } from 'sdk/module/presence/constant';
import { mockGlobalValue } from 'shield/application/mockGlobalValue';
import { mockEntity } from 'shield/application/mockEntity';
import { AbstractNotificationManager } from '../manager';
import { Jupiter, container } from 'framework';
import { config } from '../module.config';
import { INotificationService, NOTIFICATION_PRIORITY } from '../interface';

const jupiter = container.get(Jupiter);
jupiter.registerModule(config);

global.Notification = {
  requestPermission: jest.fn(),
  permission: 'default',
};

const service = jupiter.get(INotificationService);

class NotificationManager extends AbstractNotificationManager {}

jupiter.registerClass(NotificationManager);

describe('AbstractNotificationManager', () => {
  let notificationManager: AbstractNotificationManager;
  beforeEach(() => {
    jest.clearAllMocks();
    notificationManager = jupiter.get(NotificationManager);
  });

  @testable
  class show {
    @test(
      'should not call show notification when document is not focus but presence is DND [JPT-2572]',
    )
    @mockGlobalValue(1)
    @mockEntity({
      deactivated: false,
      presence: PRESENCE.DND,
    })
    t1() {
      jest.spyOn(document, 'hasFocus').mockReturnValue(false);
      jest.spyOn(service, 'show');
      notificationManager.show('blah', {
        data: {
          id: 'NotificationId',
          scope: 'string',
          priority: NOTIFICATION_PRIORITY.MESSAGE,
        },
      });
      expect(service.show).not.toHaveBeenCalled();
    }

    @test(
      'should call notificationService.show when call show and document.hasFocus is false and presence is not DND',
    )
    @mockGlobalValue(0)
    @mockEntity({
      deactivated: false,
    })
    t2() {
      jest.spyOn(document, 'hasFocus').mockReturnValue(false);
      jest.spyOn(service, 'show');
      notificationManager.show('blah', {
        data: {
          id: 'NotificationId',
          scope: 'string',
          priority: NOTIFICATION_PRIORITY.MESSAGE,
        },
      });
      expect(service.show).toHaveBeenCalled();
    }

    @test(
      'should not call notificationService.show when call show and document.hasFocus is true',
    )
    @mockGlobalValue(0)
    @mockEntity({
      deactivated: false,
    })
    t3() {
      jest.spyOn(document, 'hasFocus').mockReturnValue(true);
      jest.spyOn(service, 'show');
      notificationManager.show('blah', {
        data: {
          id: 'NotificationId',
          scope: 'string',
          priority: NOTIFICATION_PRIORITY.MESSAGE,
        },
      });
      expect(service.show).not.toHaveBeenCalled();
    }
  }

  describe('close()', () => {
    it('should call notificationService.close when call close', () => {
      jest.spyOn(service, 'close').mockImplementation();
      notificationManager.close('test');
      expect(service.close).toHaveBeenCalled();
    });
  });
  describe('clear()', () => {
    it('should call notificationService.clear when call clear', () => {
      jest.spyOn(service, 'clear').mockImplementation();
      notificationManager.clear();
      expect(service.clear).toHaveBeenCalled();
    });
  });
});
