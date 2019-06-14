import { MessageSettingManager } from '../MessageSettingManager';

describe('MessageSettingManager', () => {
  let msm: MessageSettingManager;
  const mockedSettingService = {
    registerItem: jest.fn(),
    unRegisterAll: jest.fn(),
  };
  beforeAll(() => {
    msm = new MessageSettingManager();
    msm._settingService = mockedSettingService;
    msm.init();
  });
  beforeEach(() => {});
  describe('init()', () => {
    it('should call register when init [JPT-2099]', () => {
      expect(mockedSettingService.registerItem).toHaveBeenCalled();
    });
  });
  describe('dispose()', () => {
    it('should call unregister when dispose', () => {
      msm.dispose();
      expect(mockedSettingService.unRegisterAll).toHaveBeenCalled();
    });
  });
});
