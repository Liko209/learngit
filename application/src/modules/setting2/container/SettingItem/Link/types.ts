/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 14:31:49
 * Copyright © RingCentral. All rights reserved.
 */

import { LinkSettingItem } from '@/interface/setting';
import SettingModel from '@/store/models/UserSetting';
import { SettingItemProps } from '../types';

type LinkSettingItemProps = SettingItemProps;

type LinkSettingItemViewProps = {
  settingItem: LinkSettingItem;
  settingItemEntity: SettingModel;
  getUrl(): Promise<string | void> | string | void;
};

export { LinkSettingItemProps, LinkSettingItemViewProps };
