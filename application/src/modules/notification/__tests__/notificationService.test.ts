import { Jupiter, container } from 'framework';
import * as notification from '@/modules/notification/module.config';
import { INotificationService } from '../interface';

global.Notification = {
  requestPermission: jest.fn(),
  permission: 'default',
};

const jupiter = container.get(Jupiter);
jupiter.registerModule(notification.config);

describe('NotificationService', () => {
  let service: INotificationService;
  const permissionAfterRequest = 'denied';
  beforeEach(() => {
    Notification.permission = 'default';
    jest.clearAllMocks();
    jest.spyOn(Notification, 'requestPermission').mockImplementation(() => {
      Notification.permission = permissionAfterRequest;
      return permissionAfterRequest;
    });

    const mockedSW = {
      isSupported: () => true,
      create: jest.fn(),
    };
    const mockedDT = {
      isSupported: () => true,
      create: jest.fn(),
    };
    jest.mock('../agent/SWNotification', () => ({
      SWNotification: () => mockedSW,
    }));
    jest.mock('../agent/DesktopNotification', () => ({
      DeskTopNotification: () => mockedDT,
    }));
    service = jupiter.get(INotificationService);
    service.init();
    service._notificationDistributor = mockedDT;
  });

  describe('show()', () => {
    it('should not show notification when window is focused', async () => {
      jest.spyOn(document, 'hasFocus').mockReturnValue(true);
      await service.show('', { data: { id: 0, scope: '' } });
      expect(service._notificationDistributor.create).not.toBeCalled();
    });
    describe('when permission is not granted', () => {
      it('should not create notification when permission is still not granted after request', async () => {
        jest.spyOn(document, 'hasFocus').mockReturnValue(false);
        permissionAfterRequest = 'denied';
        await service.show('', { data: { id: 0, scope: '' } });
        expect(Notification.requestPermission).toBeCalled();
        expect(service._notificationDistributor.create).not.toBeCalled();
      });
      it('should create notification if the permission is granted after request', async () => {
        jest.spyOn(document, 'hasFocus').mockReturnValue(false);
        permissionAfterRequest = 'granted';
        await service.show('', { data: { id: 0, scope: '' } });
        expect(Notification.requestPermission).toBeCalled();
        expect(service._notificationDistributor.create).toBeCalled();
      });
    });
    it('should show notification when window is focused and permission is granted', async () => {
      jest.spyOn(document, 'hasFocus').mockReturnValue(false);
      jest
        .spyOn(Notification, 'requestPermission')
        .mockResolvedValue('granted');
      Notification.permission = 'granted';
      await service.show('', { data: { id: 0, scope: '' } });
      expect(service._notificationDistributor.create).toBeCalled();
    });
  });
});
