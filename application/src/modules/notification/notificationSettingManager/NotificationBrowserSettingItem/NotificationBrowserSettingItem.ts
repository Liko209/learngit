/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-05-29 14:31:21
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { NotificationBrowserSettingItemView } from './NotificationBrowserSettingItem.View';
import { NotificationBrowserSettingItemViewModel } from './NotificationBrowserSettingItem.ViewModel';
import { NotificationBrowserSettingItemProps } from './types';

const NotificationBrowserSettingItem = buildContainer<
  NotificationBrowserSettingItemProps
>({
  View: NotificationBrowserSettingItemView,
  ViewModel: NotificationBrowserSettingItemViewModel,
});

export { NotificationBrowserSettingItem };
