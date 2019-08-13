/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-30 09:18:16
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework/ioc';
import { jupiter } from 'framework/Jupiter';
import { ISettingService } from '@/interface/setting';
import { config } from '../../../module.config';
import { PlaceholderSettingManager } from '../PlaceholderSettingManager';

jest.mock('@/history');

jupiter.registerModule(config);

function setup() {
  const manager: PlaceholderSettingManager = jupiter.get(
    PlaceholderSettingManager,
  );
  const settingService: ISettingService = jupiter.get(ISettingService);
  return { manager, settingService };
}

describe('PlaceholderSettingManager', () => {
  beforeEach(() => {
    container.snapshot();
  });
  afterEach(() => {
    container.restore();
  });

  describe('init()', () => {
    it('should register page', () => {
      const { manager, settingService } = setup();
      jest.spyOn(settingService, 'registerPage');
      manager.init();
      expect(settingService.registerPage).toHaveBeenCalled();
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
