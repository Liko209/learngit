/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-04-02 10:29:39
 * Copyright © RingCentral. All rights reserved.
 */

import SettingModel from '@/store/models/UserSetting';
import { SETTING_LIST_TYPE } from '../../SettingLeftRail/types';

type SettingContainerProps = {
  leftRailItemId: number;
};

type SettingContainerViewProps = {
  type: SETTING_LIST_TYPE;
  leftRailItemId: number;
  settingItemData: { sortSection: number[]; sortItem: {} };
  getItem: (id: number) => SettingModel;
  handleItemChange: (
    valueSetter: (value: any) => Promise<void> | void,
  ) => (newValue: any) => void;
  getCurrentTypeScrollHeight: (type: SETTING_LIST_TYPE) => number;
  setCurrentTypeScrollHeight: (type: SETTING_LIST_TYPE, height: number) => void;
} & SettingContainerProps;

export { SettingContainerProps, SettingContainerViewProps };
