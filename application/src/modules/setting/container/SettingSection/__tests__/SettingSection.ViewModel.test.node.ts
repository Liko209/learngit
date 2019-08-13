/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-30 12:35:58
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework/ioc';
import { jupiter } from 'framework/Jupiter';
import { SettingStore } from '../../../store';
import { SettingSectionViewModel } from '../SettingSection.ViewModel';

jupiter.registerClass(SettingStore);

function setup() {
  const settingStore: SettingStore = jupiter.get(SettingStore);
  const vm = new SettingSectionViewModel();
  return { vm, settingStore };
}

describe('SettingSectionViewModel', () => {
  beforeEach(() => {
    container.snapshot();
  });
  afterEach(() => {
    container.restore();
  });

  describe('section', () => {
    it('should return valid pages ', () => {
      const { vm, settingStore } = setup();
      jest
        .spyOn<SettingStore, any>(settingStore, 'getSectionById')
        .mockReturnValue({ id: 'SECTION_1' });
      expect(vm.section).toEqual({ id: 'SECTION_1' });
    });
  });

  describe('itemIds', () => {
    it('should return sections in the page', () => {
      const { vm, settingStore } = setup();
      jest
        .spyOn<SettingStore, any>(settingStore, 'getSectionVisibleItems')
        .mockReturnValue([1, 2]);

      expect(vm.itemIds).toEqual([1, 2]);
    });
  });
});
