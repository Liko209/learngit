/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-07-23 09:20:00
 * Copyright © RingCentral. All rights reserved.
 */

import { WithTranslation } from 'react-i18next';
import { IMedia } from '@/interface/media';
import { JuiAudioStatus } from 'jui/pattern/AudioPlayer/types';

type AudioEvent = {
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: () => void;
};

type AudioPlayerButtonProps = {
  media?: IMedia;
} & AudioEvent;

type AudioPlayerButtonViewProps = WithTranslation & {
  media: IMedia;
  mediaStatus: JuiAudioStatus;
  isPlaying: boolean;

  playHandler: () => void;
};

export { AudioPlayerButtonProps, AudioPlayerButtonViewProps };
