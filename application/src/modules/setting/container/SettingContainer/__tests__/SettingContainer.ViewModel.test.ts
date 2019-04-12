/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-04-02 17:29:39
 * Copyright © RingCentral. All rights reserved.
 */

import { SettingContainerViewModel } from '../SettingContainer.ViewModel';
import { SETTING_LIST_TYPE } from '../../SettingLeftRail/types';

type listStoreType = {
  height: number;
};

describe('SettingContainerViewModel', () => {
  describe('getCurrentTypeScrollHeight()', () => {
    const listStore = SettingContainerViewModel.settingListStore;
    const type = 'general' as SETTING_LIST_TYPE;
    const height = 100;

    it('should return right scroll height when it exist', () => {
      listStore.set(type, {
        height,
      });
      const model = new SettingContainerViewModel();
      expect(model.getCurrentTypeScrollHeight(type)).toEqual(height);
    });

    it('should return 0 when scroll height is not exist', () => {
      listStore.delete(type);
      const model = new SettingContainerViewModel();
      expect(model.getCurrentTypeScrollHeight(type)).toEqual(0);
    });
  });

  describe('setCurrentTypeScrollHeight()', () => {
    const listStore = SettingContainerViewModel.settingListStore;
    const type = 'general' as SETTING_LIST_TYPE;
    const height = 100;
    const model = new SettingContainerViewModel();

    model.setCurrentTypeScrollHeight(type, height);

    const { height: expectHeight } = listStore.get(type) as listStoreType;
    expect(expectHeight).toEqual(height);
  });
});
