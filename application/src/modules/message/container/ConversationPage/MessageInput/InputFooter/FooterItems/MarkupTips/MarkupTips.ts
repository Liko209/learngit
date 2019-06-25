/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-06-24 10:46:59
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { MarkupTipsView } from './MarkupTips.View';
import { MarkupTipsViewModel } from './MarkupTips.ViewModel';
import { MarkupTipsProps } from './types';

const MarkupTips = buildContainer<MarkupTipsProps>({
  ViewModel: MarkupTipsViewModel,
  View: MarkupTipsView,
});

export { MarkupTips };
