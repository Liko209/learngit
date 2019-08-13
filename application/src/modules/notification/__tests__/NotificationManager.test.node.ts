import { AbstractNotificationManager } from '../manager';
import { container } from 'framework/ioc';
import { Jupiter } from 'framework/Jupiter';
import { config } from '../module.config';
import { MediaModule } from '@/modules/media';
import { INotificationService } from '../interface';

const jupiter = container.get(Jupiter);
jupiter.registerModule(config);
jupiter.registerModule({
  entry: MediaModule,
  provides: [
    {
      name: 'IMediaService',
      value() {},
    },
  ],
});
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
