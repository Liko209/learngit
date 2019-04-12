/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:52:01
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { VoiceMailView } from './VoiceMail.View';
import { VoiceMailViewModel } from './VoiceMail.ViewModel';
import { VoiceMailProps } from './types';

const VoiceMail = buildContainer<VoiceMailProps>({
  View: VoiceMailView,
  ViewModel: VoiceMailViewModel,
});

export { VoiceMail };
