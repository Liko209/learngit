import { Jupiter, container } from 'framework';
import * as notification from '@/modules/notification/module.config';
import { INotificationService } from '../interface';
import * as userAgent from '@/common/isUserAgent';
import { ServiceLoader } from 'sdk/module/serviceLoader';

jest.mock('@/common/isUserAgent');
jest.mock('@/store/utils/entities');

global.Notification = {
  requestPermission: jest.fn().mockImplementation(() => Promise.resolve()),
  permission: 'default',
};

const jupiter = container.get(Jupiter);
jupiter.registerModule(notification.config);

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
  service._notificationDistributor = mockedDT;
}

describe('NotificationService', () => {
  beforeEach(() => {
    container.snapshot();
    Notification.permission = 'default';
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
    jest.spyOn(Notification, 'requestPermission').mockImplementation(() => {
      Notification.permission = permissionAfterRequest;
      return Promise.resolve(permissionAfterRequest);
    });
  });
  afterEach(() => {
    container.restore();
  });
  describe('shouldShowNotification', () => {
    it('shouldShowNotification should be true when isElectron is true', async () => {
      setUpMock(true, 'granted', false);
      const shouldShowNotification = await service.shouldShowNotification();
      expect(shouldShowNotification).toBeTruthy();
    });
    it('shouldShowNotification should be true when wantNotifications is true', async () => {
      setUpMock(false, 'granted', true);
      const shouldShowNotification = await service.shouldShowNotification();
      expect(shouldShowNotification).toBeTruthy();
    });
    it('shouldShowNotification should be false when isElectron is false and wantNotifications is false', async () => {
      setUpMock(false, 'granted', false);
      const shouldShowNotification = await service.shouldShowNotification();
      expect(shouldShowNotification).toBeFalsy();
    });
    it('should not show notification when shouldShowNotification is false', async () => {
      setUpMock(false, 'granted', false);
      await service.show('', { data: { id: 0, scope: '' } });
      expect(service._notificationDistributor.create).not.toHaveBeenCalled();
    });
  });

  describe('show()', () => {
    beforeEach(() => {
      setUpMock(false, 'granted', true);
    });
    it('should create notification when permission is granted', async () => {
      Notification.permission = 'granted';
      await service.show('', { data: { id: 0, scope: '' } });
      expect(service._notificationDistributor.create).toHaveBeenCalled();
    });
    it('should not create notification when permission is not granted', async () => {
      Notification.permission = 'denied';
      await service.show('', { data: { id: 0, scope: '' } });
      expect(service._notificationDistributor.create).not.toHaveBeenCalled();
    });
  });
});
