/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-07 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */
import SettingModel from '@/store/models/UserSetting';
import { RouteComponentProps } from 'react-router';

type SettingWrapperPops = RouteComponentProps<{ subPath: string }> & {
  leftRailItemIds: number[];
  getItem: (id: number) => SettingModel;
  updateCurrentLeftRailId: (id: number) => void;
};

export { SettingWrapperPops };
