/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-30 12:35:58
 * Copyright © RingCentral. All rights reserved.
 */
import { jupiter, container } from 'framework';
import { ISettingService } from '@/interface/setting';
import { SettingStore } from '../../../store/SettingStore';
import { SettingService } from '../../../service/SettingService';
import { SettingPageViewModel } from '../SettingPage.ViewModel';

jupiter.registerClass(SettingStore);
jupiter.registerService(ISettingService, SettingService);

function setup() {
  const settingStore: SettingStore = jupiter.get(SettingStore);
  const settingService: ISettingService = jupiter.get(ISettingService);
  const vm = new SettingPageViewModel();
  return { vm, settingStore, settingService };
}

describe('SettingPageViewModel', () => {
  beforeEach(() => {
    container.snapshot();
  });
  afterEach(() => {
    container.restore();
  });

  describe('page', () => {
    it('should return valid pages ', () => {
      const { vm, settingStore } = setup();
      jest
        .spyOn<SettingStore, any>(settingStore, 'getPageById')
        .mockReturnValue({ id: 'PAGE_1' });

      expect(vm.page).toEqual({ id: 'PAGE_1' });
    });
  });

  describe('sectionIds', () => {
    it('should return sections in the page', () => {
      const { vm, settingStore } = setup();
      jest
        .spyOn<SettingStore, any>(settingStore, 'getPageById')
        .mockReturnValue({ id: 'PAGE_1' });
      jest
        .spyOn(settingStore, 'getNoEmptyPageSections')
        .mockReturnValue(['SECTION_1', 'SECTION_2']);

      expect(vm.sectionIds).toEqual(['SECTION_1', 'SECTION_2']);
    });

    it('should return [] when page not found', () => {
      const { vm } = setup();
      expect(vm.sectionIds).toEqual([]);
    });
  });
});
