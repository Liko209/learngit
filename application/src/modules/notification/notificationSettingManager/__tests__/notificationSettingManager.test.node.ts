import { SETTING_SECTION } from '@/modules/notification/notificationSettingManager/constant';
import { NotificationSettingManager } from '../notificationSettingManager';

describe(NotificationSettingManager.name, () => {
  const manager = new NotificationSettingManager();
  const mockedSettingService = {
    registerSection: jest.fn(),
    registerItem: jest.fn(),
  };
  Object.assign(manager, { _settingService: mockedSettingService });
  manager.init();
  beforeAll(() => {});
  describe('init', () => {
    it('should register section when call init [JPT-2099]', () => {
      expect(mockedSettingService.registerSection).toHaveBeenCalled();
      const args = mockedSettingService.registerSection.mock.calls.map(
        i => i[2].id,
      );
      const sectionAllRegistered = [
        SETTING_SECTION.DESKTOP_NOTIFICATIONS,
        // SETTING_SECTION.OTHER_NOTIFICATION_SETTINGS,
        SETTING_SECTION.EMAIL_NOTIFICATIONS,
      ].some(i => !args.includes(i));
      expect(sectionAllRegistered).toBeFalsy();
    });
  });
});
