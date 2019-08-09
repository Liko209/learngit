/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-07-01 15:00:00
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { AudioPlayerProps } from './types';
import { AudioPlayerView } from './AudioPlayer.View';
import { AudioPlayerViewModel } from './AudioPlayer.ViewModel';

const AudioPlayer = buildContainer<AudioPlayerProps>({
  View: AudioPlayerView,
  ViewModel: AudioPlayerViewModel,
});

export { AudioPlayer };
