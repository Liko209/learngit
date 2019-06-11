/*
 * @Author: isaac.liu
 * @Date: 2019-05-27 10:39:27
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { VoicemailView } from './Voicemail.View';
import { VoicemailViewModel } from './Voicemail.ViewModel';
import { VoicemailProps } from './types';

const Voicemail = buildContainer<VoicemailProps>({
  View: VoicemailView,
  ViewModel: VoicemailViewModel,
});

export { Voicemail };
