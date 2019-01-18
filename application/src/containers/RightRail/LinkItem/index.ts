/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-09 14:12:56
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { LinkItemView } from './LinkItem.View';
import { LinkItemViewModel } from './LinkItem.ViewModel';

const LinkItem = buildContainer({
  View: LinkItemView,
  ViewModel: LinkItemViewModel,
});

export { LinkItem };
