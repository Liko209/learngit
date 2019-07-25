/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-07-23 09:20:00
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { AudioPlayerButtonProps } from './types';
import { AudioPlayerButtonView } from './AudioPlayerButton.View';
import { AudioPlayerButtonViewModel } from './AudioPlayerButton.ViewModel';

const AudioPlayerButton = buildContainer<AudioPlayerButtonProps>({
  View: AudioPlayerButtonView,
  ViewModel: AudioPlayerButtonViewModel,
});

export { AudioPlayerButton };
