/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-01 14:56:34
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { VoicemailItemView } from './VoicemailItem.View';
import { VoicemailItemViewModel } from './VoicemailItem.ViewModel';
import { VoicemailProps } from './types';

const VoicemailItem = buildContainer<VoicemailProps>({
  View: VoicemailItemView,
  ViewModel: VoicemailItemViewModel,
});

export { VoicemailItem };
