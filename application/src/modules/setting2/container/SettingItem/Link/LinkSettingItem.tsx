/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 10:51:43
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { LinkSettingItemView } from './LinkSettingItem.View';
import { LinkSettingItemViewModel } from './LinkSettingItem.ViewModel';
import { LinkSettingItemProps } from './types';

const LinkSettingItem = buildContainer<LinkSettingItemProps>({
  View: LinkSettingItemView,
  ViewModel: LinkSettingItemViewModel,
});

export { LinkSettingItem, LinkSettingItemProps };
