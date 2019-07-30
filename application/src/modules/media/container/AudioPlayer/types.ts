/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-07-01 15:00:00
 * Copyright © RingCentral. All rights reserved.
 */
import { WithTranslation } from 'react-i18next';
import { MediaOptions, IMedia } from '@/interface/media';
import { JuiAudioMode, JuiAudioStatus } from 'jui/pattern/AudioPlayer/types';

type AudioEvent = {
  onBeforePlay?: () => Promise<boolean> | boolean;
  onBeforePause?: () => Promise<boolean> | boolean;
  onBeforeReload?: () => Promise<boolean> | boolean;
  onPlay?: () => void;
  onPaused?: () => void;
  onEnded?: () => void;
  onError?: () => void;
  onTimeUpdate?: (timestamp: number) => void;
};

type AudioPlayerProps = {
  id?: string;
  src?: MediaOptions['src'];
  media?: IMedia;
  duration?: number;

  trackId?: string;
  mode?: JuiAudioMode;
  startTime?: number;
  isHighlight?: boolean;
  autoDispose?: boolean;
} & AudioEvent;

type AudioPlayerViewProps = WithTranslation & {
  id?: string;
  trackId?: string;
  media: IMedia;
  mediaStatus: JuiAudioStatus;
  currentTime: number;
  currentDuration: number;

  src: MediaOptions['src'];
  duration: number;
  mode?: JuiAudioMode;
  startTime?: number;
  isHighlight?: boolean;

  playHandler: () => void;
  pauseHandler: () => void;
  reloadHandler: () => void;

  dragHandler: () => void;
  timestampHandler: (timestamp: number) => void;
};

export { AudioPlayerProps, AudioPlayerViewProps };
