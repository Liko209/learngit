/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-30 09:23:02
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { LinkItemView } from './LinkItem.View';
import { LinkItemViewModel } from './LinkItem.ViewModel';

const LinkItem = buildContainer({
  ViewModel: LinkItemViewModel,
  View: LinkItemView,
});

export { LinkItem };
