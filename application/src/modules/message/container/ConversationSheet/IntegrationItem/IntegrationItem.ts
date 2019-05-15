/*
 * @Author: isaac.liu
 * @Date: 2019-05-03 09:57:59
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { IntegrationItemView } from './IntegrationItem.View';
import { IntegrationItemViewModel } from './IntegrationItem.ViewModel';
import { IntegrationItemProps } from './types';

const IntegrationItem = buildContainer<IntegrationItemProps>({
  View: IntegrationItemView,
  ViewModel: IntegrationItemViewModel,
});

export { IntegrationItem };
