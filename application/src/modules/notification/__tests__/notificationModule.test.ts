import { Jupiter, container } from 'framework';
import { NotificationModule } from '../notificationModule';
import { config } from '../module.config';
import { config as LeaveBlockerConfig } from '../../leave-blocker/module.config';
import {
  LEAVE_BLOCKER_SERVICE,
  ILeaveBlockerService,
} from '@/modules/leave-blocker/interface';
import { INotificationService } from '../interface';
import { NOTIFICATION_SERVICE } from '../interface/constant';

const jupiter = container.get(Jupiter);
jupiter.registerModule(LeaveBlockerConfig);
jupiter.registerModule(config);

describe('NotificationModule', () => {
  let module: NotificationModule;
  let leaveBlockerService: ILeaveBlockerService;
  let notificationService: INotificationService;

  beforeEach(() => {
    module = jupiter.get(NotificationModule);
    leaveBlockerService = jupiter.get(LEAVE_BLOCKER_SERVICE);
    notificationService = jupiter.get(NOTIFICATION_SERVICE);
    jest.spyOn(leaveBlockerService, 'onLeave').mockImplementation(() => {});
    jest.spyOn(leaveBlockerService, 'offLeave').mockImplementation(() => {});
    jest.spyOn(notificationService, 'clear').mockImplementation(() => {});
    jupiter.bootstrap();
  });

  it('should add leave hooker when bootstrapped', async () => {
    expect(leaveBlockerService.onLeave).toBeCalledWith(module.onLeaveHook);
  });

  describe('dispose()', () => {
    it('should clear all the notification when disposed (logout or close tab)', () => {
      module.dispose();
      expect(notificationService.clear).toBeCalled();
    });
    it('should dismantle leaveBlock service when disposed', () => {
      module.dispose();
      expect(leaveBlockerService.offLeave).toBeCalledWith(module.onLeaveHook);
    });
  });
});
