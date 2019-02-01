/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-30 14:37:42
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { PersonItemView } from './PersonItem.View';
import { PersonItemViewModel } from './PersonItem.ViewModel';

const PersonItem = buildContainer<any>({
  ViewModel: PersonItemViewModel,
  View: PersonItemView,
});

export { PersonItem };
