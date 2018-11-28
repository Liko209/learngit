/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:07
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { PrivacyView } from './Privacy.View';
import { PrivacyViewModel } from './Privacy.ViewModel';
import { PrivacyProps } from './types';

const Privacy = buildContainer<PrivacyProps>({
  View: PrivacyView,
  ViewModel: PrivacyViewModel,
});

export { Privacy };
