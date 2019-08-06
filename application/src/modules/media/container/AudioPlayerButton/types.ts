/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-07-23 09:20:00
 * Copyright © RingCentral. All rights reserved.
 */

import { WithTranslation } from 'react-i18next';
import { IMedia } from '@/interface/media';
import { JuiAudioStatus } from 'jui/components/AudioPlayer/types';
import { JuiAudioActionIcon } from 'jui/components/AudioPlayer';

type AudioEvent = {
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: () => void;
};

type AudioPlayerButtonProps = {
  media?: IMedia;
  actionIcon?: JuiAudioActionIcon;
} & AudioEvent;

type AudioPlayerButtonViewProps = WithTranslation & {
  media: IMedia;
  mediaStatus: JuiAudioStatus;
  isPlaying: boolean;
  actionIcon?: JuiAudioActionIcon;
  playHandler: () => void;
};

export { AudioPlayerButtonProps, AudioPlayerButtonViewProps };
