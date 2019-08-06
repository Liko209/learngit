/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-08-06 11:14:11
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { SelectItemView } from './SelectItem.View';
import { SelectItemViewModel } from './SelectItem.ViewModel';
import { SelectItemProps } from './types';

const SelectItem = buildContainer<SelectItemProps<T>>({
  View: SelectItemView,
  ViewModel: SelectItemViewModel,
});

export { SelectItem, SelectItemProps };
