/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-08-21 14:17:30
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { AudioConferenceView } from './AudioConference.View';
import { AudioConferenceViewModel } from './AudioConference.ViewModel';
import { AudioConferenceProps } from './types';

const AudioConference = buildContainer<AudioConferenceProps>({
  View: AudioConferenceView,
  ViewModel: AudioConferenceViewModel,
});

export { AudioConference };
