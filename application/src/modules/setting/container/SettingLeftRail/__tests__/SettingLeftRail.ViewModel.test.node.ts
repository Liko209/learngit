/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-30 12:35:58
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework/ioc';
import { jupiter } from 'framework/Jupiter';
import { ISettingService } from '@/interface/setting';
import { SettingStore } from '../../../store/SettingStore';
import { SettingService } from '../../../service/SettingService';
import { SettingLeftRailViewModel } from '../SettingLeftRail.ViewModel';

jupiter.registerClass(SettingStore);
jupiter.registerService(ISettingService, SettingService);

function setup() {
  const settingStore: SettingStore = jupiter.get(SettingStore);
  const settingService: ISettingService = jupiter.get(ISettingService);
  const vm = new SettingLeftRailViewModel();
  return { vm, settingStore, settingService };
}

describe('SettingLeftRailViewModel', () => {
  beforeEach(() => {
    container.snapshot();
  });
  afterEach(() => {
    container.restore();
  });

  describe('pages', () => {
    it('should return valid pages ', () => {
      const { vm, settingStore } = setup();
      jest
        .spyOn(settingStore, 'getAllPages')
        .mockReturnValue(['PAGE_1', 'PAGE_2']);
      jest
        .spyOn<SettingStore, any>(settingStore, 'getPageById')
        .mockReturnValueOnce({ id: 'PAGE_1' })
        .mockReturnValueOnce({ id: 'PAGE_2' });

      expect(vm.pages).toEqual([{ id: 'PAGE_1' }, { id: 'PAGE_2' }]);
    });
  });

  describe('currentPage', () => {
    it('should return currentPage', () => {
      const { vm, settingStore } = setup();
      jest
        .spyOn<SettingStore, any>(settingStore, 'getPageById')
        .mockReturnValue({ id: 'PAGE_1' });
      expect(vm.currentPage).toEqual({ id: 'PAGE_1' });
    });
  });

  describe('goToSettingPage()', () => {
    it('should call settingService', () => {
      const { vm, settingService } = setup();
      jest.spyOn(settingService, 'goToSettingPage');
      vm.goToSettingPage('PAGE_1');
      expect(settingService.goToSettingPage).toHaveBeenCalledWith('PAGE_1');
    });
  });
});
