import { Jupiter, container } from 'framework';
import { NotificationModule } from '../notificationModule';
import { config } from '../module.config';
import { config as settingConfig } from '@/modules/setting/module.config';
import { INotificationService } from '../interface';
import { notificationCenter } from 'sdk/service';
import { SERVICE } from 'sdk/service/eventKey';

global.Notification = {
  requestPermission: jest.fn(),
  permission: 'default',
};

const jupiter = container.get(Jupiter);
jupiter.registerModule(settingConfig);
jupiter.registerModule(config);

jest.mock('../agent/SWNotification', () => ({
  SWNotification: () => ({
    isSupported: () => true,
    create: jest.fn(),
  }),
}));
jest.mock('../agent/DesktopNotification', () => ({
  DeskTopNotification: () => ({
    isSupported: () => true,
    create: jest.fn(),
  }),
}));

describe('NotificationModule', () => {
  let module: NotificationModule;
  let notificationService: INotificationService;

  beforeAll(() => {
    module = jupiter.get(NotificationModule);
    notificationService = jupiter.get(INotificationService);
    notificationCenter.on = jest.fn();
    notificationCenter.off = jest.fn();
    jest.spyOn(notificationService, 'clear').mockImplementation(() => {});
    jupiter.bootstrap();
  });

  it('should add logout listener when bootstrapped', async () => {
    expect(notificationCenter.on).toHaveBeenCalledWith(SERVICE.LOGOUT, module.onLogoutHook);
  });

  describe('dispose()', () => {
    it('should clear all the notification when disposed (logout)', () => {
      module.dispose();
      expect(notificationService.clear).toHaveBeenCalled();
    });
    it('should remove listener for logout when disposed', () => {
      module.dispose();
      expect(notificationCenter.off).toHaveBeenCalledWith(SERVICE.LOGOUT, module.onLogoutHook);
    });
  });
});
