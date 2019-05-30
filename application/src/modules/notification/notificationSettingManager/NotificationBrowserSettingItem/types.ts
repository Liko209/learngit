/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-05-29 15:47:37
 * Copyright © RingCentral. All rights reserved.
 */

import SettingModel from '@/store/models/UserSetting';
import { DesktopNotificationsSettingModel } from 'sdk/module/profile';
type NotificationBrowserSettingItemViewProps = {
  settingItemEntity: SettingModel<DesktopNotificationsSettingModel>;
  settingValue: DesktopNotificationsSettingModel;
  setToggleState: (checked: boolean) => void;
};

export { NotificationBrowserSettingItemViewProps };
