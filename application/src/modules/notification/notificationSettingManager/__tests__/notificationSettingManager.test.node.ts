import {
  SETTING_SECTION__DESKTOP_NOTIFICATIONS,
  SETTING_SECTION__EMAIL_NOTIFICATIONS,
  SETTING_SECTION__OTHER_NOTIFICATION_SETTINGS,
} from '@/modules/notification/notificationSettingManager/constant';
import { NotificationSettingManager } from '../notificationSettingManager';

describe(NotificationSettingManager.name, () => {
  let manager = new NotificationSettingManager();
  let mockedSettingService = {
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
        SETTING_SECTION__OTHER_NOTIFICATION_SETTINGS,
        SETTING_SECTION__EMAIL_NOTIFICATIONS,
        SETTING_SECTION__DESKTOP_NOTIFICATIONS,
      ].some(i => !args.includes(i));
      expect(sectionAllRegistered).toBeFalsy();
    });
  });
});
