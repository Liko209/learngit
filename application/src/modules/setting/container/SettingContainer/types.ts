/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-04-02 10:29:39
 * Copyright © RingCentral. All rights reserved.
 */

import { SETTING_LIST_TYPE } from '../SettingLeftRail/types';

type SettingContainerProps = {
  type: SETTING_LIST_TYPE;
};

type SettingContainerViewProps = {
  type: SETTING_LIST_TYPE;
  getCurrentTypeScrollHeight: (type: SETTING_LIST_TYPE) => number;
  setCurrentTypeScrollHeight: (type: SETTING_LIST_TYPE, height: number) => void;
};

export { SettingContainerProps, SettingContainerViewProps };
