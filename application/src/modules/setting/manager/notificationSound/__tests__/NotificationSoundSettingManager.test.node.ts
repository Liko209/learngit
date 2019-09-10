/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-30 09:18:16
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework/ioc';
import { jupiter } from 'framework/Jupiter';
import { ISettingService } from '@/interface/setting';
import { config } from '../../../module.config';
import { NotificationSoundSettingManager } from '../NotificationSoundSettingManager';
import { SETTING_SECTION__SOUNDS } from '../constant';

jest.mock('@/history');

jupiter.registerModule(config);

function setup() {
  const manager: NotificationSoundSettingManager = jupiter.get(
    NotificationSoundSettingManager,
  );
  const settingService: ISettingService = jupiter.get(ISettingService);
  return { manager, settingService };
}

describe('NotificationSoundSettingManager', () => {
  beforeEach(() => {
    container.snapshot();
  });
  afterEach(() => {
    container.restore();
  });

  describe('init()', () => {
    it.only('should register page [JPT-2099]', () => {
      const { manager, settingService } = setup();
      jest.spyOn(settingService, 'registerPage');
      manager.init();
      expect(settingService.registerPage).toHaveBeenCalled();
      expect(settingService.registerPage.mock.calls[0][1].sections[0].id).toBe(
        SETTING_SECTION__SOUNDS,
      );
    });
  });

  describe('dispose()', () => {
    it('should un-register page', () => {
      const { manager, settingService } = setup();
      jest.spyOn(settingService, 'unRegisterAll');
      manager.dispose();
      expect(settingService.unRegisterAll).toHaveBeenCalled();
    });
  });
});
