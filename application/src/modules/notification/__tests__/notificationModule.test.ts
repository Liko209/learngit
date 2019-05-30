import { Jupiter, container } from 'framework';
import { NotificationModule } from '../notificationModule';
import { config } from '../module.config';
import { config as leaveBlockerConfig } from '../../leave-blocker/module.config';
import { ILeaveBlockerService } from '@/modules/leave-blocker/interface';
import { INotificationService } from '../interface';

global.Notification = {
  requestPermission: jest.fn(),
  permission: 'default',
};

const jupiter = container.get(Jupiter);
jupiter.registerModule(leaveBlockerConfig);
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
  let leaveBlockerService: ILeaveBlockerService;
  let notificationService: INotificationService;

  beforeAll(() => {
    module = jupiter.get(NotificationModule);
    leaveBlockerService = jupiter.get(ILeaveBlockerService);
    notificationService = jupiter.get(INotificationService);
    jest.spyOn(leaveBlockerService, 'onLeave').mockImplementation(() => {});
    jest.spyOn(leaveBlockerService, 'offLeave').mockImplementation(() => {});
    jest.spyOn(notificationService, 'clear').mockImplementation(() => {});
    jupiter.bootstrap();
  });

  afterEach(() => {
    module.dispose();
  });

  it('should add leave hooker when bootstrapped', async () => {
    expect(leaveBlockerService.onLeave).toBeCalledWith(module.onLeaveHook);
  });

  describe('dispose()', () => {
    it('should clear all the notification when disposed (logout or close tab)', () => {
      expect(notificationService.clear).toBeCalled();
    });
    it('should dismantle leaveBlock service when disposed', () => {
      expect(leaveBlockerService.offLeave).toBeCalledWith(module.onLeaveHook);
    });
  });
});
