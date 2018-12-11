/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-10 16:17:36
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { QuoteView } from './Quote.View';
import { QuoteViewModel } from './Quote.ViewModel';
import { Props } from './types';

const Quote = buildContainer<Props>({
  View: QuoteView,
  ViewModel: QuoteViewModel,
});

export { Quote, Props };
