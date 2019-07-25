/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-07-23 10:31:26
 * Copyright © RingCentral. All rights reserved.
 */

import SettingModel from '@/store/models/UserSetting';

type E911SettingItemProps = {
  settingItemEntity: SettingModel;
  id: number;
};

type E911SettingItemViewProps = E911SettingItemProps & {
  showUserE911: string;
};

export { E911SettingItemViewProps, E911SettingItemProps };
