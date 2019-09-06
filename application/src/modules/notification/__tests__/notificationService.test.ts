import { Jupiter, container } from 'framework';
import * as notification from '@/modules/notification/module.config';
import { MediaModule } from '@/modules/media';
import { INotificationService, NotificationStrategy } from '../interface';
import * as userAgent from '@/common/isUserAgent';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import * as utils from '../utils';

jest.mock('@/common/isUserAgent');
jest.mock('@/store/utils/entities');
jest.mock('mobx');
document.hasFous = jest.fn().mockReturnValue(false);
global.Notification = function () {
  return {};
};
global.Notification.requestPermission = jest
  .fn()
  .mockImplementation(() => Promise.resolve());
global.Notification.permission = 'default';

const jupiter = container.get(Jupiter);
jupiter.registerModule(notification.config);
jupiter.registerModule({
  entry: MediaModule,
  provides: [
    {
      name: 'IMediaService',
      value() {
        return { create: jest.fn().mockName('happy') };
      },
    },
  ],
});
let service: INotificationService;
const permissionAfterRequest = 'denied';

function setUpMock(
  isElectron: boolean,
  browserPermission: NotificationPermission,
  wantNotifications: boolean,
) {
  userAgent.isElectron = isElectron;
  jest.spyOn(ServiceLoader, 'getInstance').mockImplementation(() => ({
    getById: () => ({
      value: {
        browserPermission,
        wantNotifications,
      },
    }),
  }));
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
  service._uiNotificationDistributor = mockedDT;
}

describe('NotificationService', () => {
  beforeEach(() => {
    container.snapshot();
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
    Notification.permission = 'default';
    document.hasFocus = jest.fn().mockReturnValue(false);
    jest.spyOn(utils, 'isCurrentUserDND').mockReturnValue(false);
    jest.spyOn(Notification, 'requestPermission').mockImplementation(() => {
      Notification.permission = permissionAfterRequest;
      return Promise.resolve(permissionAfterRequest);
    });
  });
  afterEach(() => {
    container.restore();
  });
  describe('shouldShowUINotification', () => {
    it('shouldShowUINotification should be false when DND is true [JPT-2712]', async () => {
      Notification.permission = 'granted';
      jest.spyOn(utils, 'isCurrentUserDND').mockReturnValue(true);
      setUpMock(false, 'granted', true);
      const shouldShowUINotification = await service.shouldShowUINotification();
      expect(shouldShowUINotification).toBeFalsy();
    });

    it('shouldShowUINotification should be false when document.hasFocus is true [JPT-2570]', async () => {
      Notification.permission = 'granted';
      document.hasFocus = jest.fn().mockReturnValueOnce(true);
      setUpMock(true, 'granted', true);
      const shouldShowUINotification = await service.shouldShowUINotification();
      expect(shouldShowUINotification).toBeFalsy();
    });
    it('shouldShowUINotification should be true when isElectron is true', async () => {
      Notification.permission = 'granted';
      setUpMock(true, 'granted', true);
      const shouldShowUINotification = await service.shouldShowUINotification();
      expect(shouldShowUINotification).toBeTruthy();
    });
    it('shouldShowUINotification should be true when wantNotifications is true', async () => {
      setUpMock(false, 'granted', true);
      Notification.permission = 'granted';
      const shouldShowUINotification = await service.shouldShowUINotification();

      expect(shouldShowUINotification).toBeTruthy();
    });
    it('shouldShowUINotification should be false when isElectron is false and wantNotifications is false', async () => {
      setUpMock(false, 'granted', false);
      const shouldShowUINotification = await service.shouldShowUINotification();
      expect(shouldShowUINotification).toBeFalsy();
    });
    it('should not show notification when shouldShowUINotification is false', async () => {
      setUpMock(false, 'granted', false);
      await service.show('', {
        strategy: NotificationStrategy.UI_NOTIFICATION_ONLY,
        data: { id: 0, scope: '' },
      });
      expect(service._uiNotificationDistributor.create).not.toHaveBeenCalled();
    });
  });

  describe('show()', () => {
    beforeEach(() => {
      setUpMock(false, 'granted', true);
    });
    it('should create notification when permission is granted', async () => {
      Notification.permission = 'granted';
      await service.show('', {
        strategy: NotificationStrategy.UI_NOTIFICATION_ONLY,
        data: { id: 0, scope: '' },
      });

      expect(service._uiNotificationDistributor.create).toHaveBeenCalled();
    });
    it('should not create notification when permission is not granted', async () => {
      Notification.permission = 'denied';
      await service.show('', {
        strategy: NotificationStrategy.UI_NOTIFICATION_ONLY,
        data: { id: 0, scope: '' },
      });
      expect(service._uiNotificationDistributor.create).not.toHaveBeenCalled();
    });
    it('should not create ui notification and sound when app is focused and strategy is ui&sounds [JPT-2570]', async () => {
      jest.spyOn(service._soundNotification, 'create').mockImplementation();
      document.hasFocus = jest.fn().mockReturnValueOnce(true);
      setUpMock(false, 'granted', true);
      await service.show('', {
        strategy: NotificationStrategy.SOUND_AND_UI_NOTIFICATION,
        sound: 'mock',
        data: { id: 0, scope: '' },
      });
      expect(service._uiNotificationDistributor.create).not.toHaveBeenCalled();
      expect(service._soundNotification.create).not.toHaveBeenCalled();
    });
    it('should not create ui notification and sound when ui notification is turn off and strategy is ui&sounds [JPT-2573]', async () => {
      jest.spyOn(service._soundNotification, 'create').mockImplementation();
      setUpMock(false, 'granted', false);
      await service.show('', {
        strategy: NotificationStrategy.SOUND_AND_UI_NOTIFICATION,
        sound: 'mock',
        data: { id: 0, scope: '' },
      });
      expect(service._uiNotificationDistributor.create).not.toHaveBeenCalled();
      expect(service._soundNotification.create).not.toHaveBeenCalled();
    });
    it('should not create ui notification and sound when ui notification is turn off and strategy is ui&sounds [JPT-2576]', async () => {
      setUpMock(false, 'granted', false);
      jest.spyOn(service._soundNotification, 'create').mockImplementation();
      await service.show('', {
        strategy: NotificationStrategy.SOUND_OR_UI_NOTIFICATION,
        sound: 'mock',
        data: { id: 0, scope: '' },
      });
      expect(service._uiNotificationDistributor.create).not.toHaveBeenCalled();
      expect(service._soundNotification.create).toHaveBeenCalled();
    });
  });
});
