import { MessageSettingManager } from '../MessageSettingManager';
import * as utils from '@/modules/setting/utils';
describe('MessageSettingManager', () => {
  let msm: MessageSettingManager;
  const mockedSettingService = {
    registerItem: jest.fn(),
    unRegisterAll: jest.fn(),
  };
  const emailNotificationTitleAndDescBuilder = jest.fn();
  jest
    .spyOn(utils, 'buildTitleAndDesc')
    .mockReturnValue(emailNotificationTitleAndDescBuilder);
  beforeAll(async () => {
    msm = new MessageSettingManager();
    msm._settingService = mockedSettingService;
    await msm.init();
  });
  beforeEach(() => {});
  describe('init()', () => {
    it('should call register when init [JPT-2099]', () => {
      expect(mockedSettingService.registerItem).toHaveBeenCalled();
    });
    it('the description and title should be correct', () => {
      expect(utils.buildTitleAndDesc).toBeCalledWith(
        'notificationAndSounds',
        'emailNotifications',
      );
      expect(emailNotificationTitleAndDescBuilder).toBeCalledTimes(4);
      const args = emailNotificationTitleAndDescBuilder.mock.calls.map(
        i => i[0],
      );
      expect(args).toEqual([
        'directMessages',
        'mentions',
        'teams',
        'dailyDigest',
      ]);
    });
  });
  describe('dispose()', () => {
    it('should call unregister when dispose', () => {
      msm.dispose();
      expect(mockedSettingService.unRegisterAll).toHaveBeenCalled();
    });
  });
});
