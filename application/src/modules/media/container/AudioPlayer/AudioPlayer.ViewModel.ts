/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-07-01 15:00:00
 * Copyright © RingCentral. All rights reserved.
 */
import StoreViewModel from '@/store/ViewModel';
import { AudioPlayerProps } from './types';
import { jupiter } from 'framework/Jupiter';
import { mainLogger } from 'foundation/log';
import { MediaOptions, IMediaService, IMedia } from '@/interface/media';
import { observable, action, computed } from 'mobx';
import { JuiAudioStatus } from 'jui/components/AudioPlayer';
import { Media } from '../../Media';

const LOADING_TIME = 250;

class AudioPlayerViewModel extends StoreViewModel<AudioPlayerProps> {
  @observable
  private _media: IMedia | null = null;

  @observable
  private _mediaStatus: JuiAudioStatus = JuiAudioStatus.PLAY;

  @observable
  private _currentTime: number = 0;

  @observable
  private _currentDuration: number = 0;

  @observable
  private _isPlayingBefore: boolean = false;

  private _currentSrc: MediaOptions['src'] = '';

  private _loadingTimer: NodeJS.Timeout;

  private _disposeGetMediaReaction: () => void;
  private _disposeCreateMediaReaction: () => void;

  constructor(props: AudioPlayerProps) {
    super(props);

    this._disposeGetMediaReaction = this.reaction(
      () => this.props.id,
      this._propIdReaction,
      {
        fireImmediately: true,
      },
    );
    this._disposeCreateMediaReaction = this.reaction(
      () => this.props.src,
      this._propSrcReaction,
      {
        fireImmediately: true,
      },
    );

    this.reaction(() => this.props.media, this._propMediaReaction, {
      fireImmediately: true,
    });
  }

  private _propIdReaction = (id: AudioPlayerProps['id']) => {
    id && !this._media && this._getMedia(id);
  };

  private _propSrcReaction = (src: AudioPlayerProps['src']) => {
    if (src && src !== this._currentSrc) {
      if (this._media) {
        this._disposeMedia();
        this._resetAudioPlayer();
      }
      !this._media && this._createMedia();
    }
  };

  private _propMediaReaction = (media: AudioPlayerProps['media']) => {
    if (media) {
      if (!(media instanceof Media)) {
        throw new Error('[AudioPlayer] please check media props');
      }
      if (this.props.trackId) {
        mainLogger.warn(
          '[AudioPlayer] media is created outside, trackId is not working.',
        );
      }
      if (this._media === media) {
        return;
      }
      this._media = media;
      if (this._media) {
        this._disposeCreateMediaReaction();
        this._disposeGetMediaReaction();

        this._currentSrc = this._media.src;
        this._bindMediaEvent();
      }
    }
  };

  private get _mediaService() {
    return jupiter.get<IMediaService>(IMediaService);
  }

  private get _mediaOptions(): MediaOptions {
    const { id, src, trackId } = this.props;
    return {
      id,
      src: src || '',
      trackId,
    };
  }

  @action
  private _getMedia = (mediaId: string) => {
    const existMedia = this._mediaService.getMedia(mediaId);
    if (existMedia) {
      this._media = existMedia;
      this._currentSrc = this.props.src || '';
      this._mediaStatus = this._media.playing
        ? JuiAudioStatus.PAUSE
        : JuiAudioStatus.PLAY;
      this._bindMediaEvent();
    }
    return existMedia;
  };

  @action
  private _createMedia = () => {
    this._currentSrc = this.props.src || '';

    this._media = this._mediaService.createMedia(this._mediaOptions);
    if (this._media) {
      this._bindMediaEvent();

      const { startTime } = this.props;
      if (startTime) {
        this._currentTime = startTime;
      }
    }
    return this._media;
  };

  playHandler = () => {
    this._playMedia();
  };

  pauseHandler = () => {
    this._pauseMedia();
  };

  reloadHandler = () => {
    this._reloadMedia();
  };

  @action
  timestampHandler = (timestamp: number) => {
    const { duration } = this.props;

    const hasMedia = !!this._media;
    const media = this._media as IMedia;

    const hasMediaDuration = !!(this._media && this._media.duration);
    const mediaDuration = (this._media && this._media.duration) as number;

    const propDuration = duration as number;

    const isOutDuration = (timestamp: number, duration: number) => {
      return timestamp < 0 || Math.round(timestamp) >= Math.round(duration);
    };

    const _duration = mediaDuration || propDuration;
    if (!_duration) {
      return;
    }
    if (isOutDuration(timestamp, _duration)) {
      hasMedia && media.stop();
      this._updateTime(0);
    } else {
      const shouldContinue = hasMediaDuration && this._isPlayingBefore;
      hasMedia && media.setCurrentTime(timestamp, shouldContinue);
      this._updateTime(timestamp);
    }
  };

  @action
  private _updateTime(timestamp: number) {
    const { onTimeUpdate } = this.props;
    this._currentTime = timestamp;
    onTimeUpdate && onTimeUpdate(timestamp);
  }

  @action
  dragHandler = () => {
    if (!this._media) {
      return;
    }

    this._isPlayingBefore = this._media.playing;
  };

  @action
  pauseMedia = () => {
    if (!this._media) {
      return;
    }

    this._pauseMedia();
  };

  @action
  dispose() {
    super.dispose();
    const { autoDispose = true } = this.props;
    this._unbindMediaEvent();
    if (autoDispose) {
      this._disposeMedia();
      this._resetAudioPlayer();
    }
  }

  @action
  private _disposeMedia = () => {
    if (this._media) {
      this._media.stop();
      this._unbindMediaEvent();
    }
  };

  @action
  private _resetAudioPlayer() {
    if (this._media) {
      this._media = null;
      this._currentTime = 0;
      this._currentDuration = 0;
      this._currentSrc = '';
    }
  }

  private _playMedia = async () => {
    const { onBeforePlay, startTime } = this.props;

    this._loadingStatusTimer();

    if (onBeforePlay) {
      const isCtn = await onBeforePlay();
      if (!isCtn) {
        this._mediaStatus = JuiAudioStatus.RELOAD;
        return;
      }
    }

    if (this._currentSrc === '') {
      throw new Error('Voicemail audio source error');
    }

    if (!this._media) {
      return;
    }

    const startTimestamp =
      this._currentTime || (typeof startTime !== 'undefined' && startTime) || 0;

    this._media.play({
      startTime: startTimestamp,
    });
  };

  private _pauseMedia = async () => {
    if (!this._media) {
      return;
    }

    const { onBeforePause } = this.props;

    if (onBeforePause) {
      const isCtn = await onBeforePause();
      if (!isCtn) {
        return;
      }
    }

    this._media.pause();
  };

  private _reloadMedia = async () => {
    if (!this._media) {
      return;
    }

    const { onBeforeReload } = this.props;
    if (onBeforeReload) {
      const isCtn = await onBeforeReload();
      if (!isCtn) {
        this._mediaStatus = JuiAudioStatus.RELOAD;
        return;
      }
    }

    this._playMedia();
  };

  private _bindMediaEvent = () => {
    if (!this._media) {
      return;
    }
    this._media.on('loadeddata', this._onLoadeddata);
    this._media.on('play', this._onPlay);
    this._media.on('pause', this._onPause);
    this._media.on('timeupdate', this._onTimeUpdate);
    this._media.on('ended', this._onEnded);
    this._media.on('error', this._onError);
    this._media.onReset(() => {
      this._mediaStatus = JuiAudioStatus.PLAY;
      this.props.onPaused && this.props.onPaused();
    });
  };

  private _unbindMediaEvent = () => {
    if (!this._media) {
      return;
    }
    this._media.off('loadeddata', this._onLoadeddata);
    this._media.off('play', this._onPlay);
    this._media.off('pause', this._onPause);
    this._media.off('timeupdate', this._onTimeUpdate);
    this._media.off('ended', this._onEnded);
    this._media.off('error', this._onError);
  };

  @action
  private _onLoadeddata = () => {
    this._currentDuration = (this._media && this._media.duration) || 0;
  };

  @action
  private _onPlay = () => {
    const { onPlay } = this.props;
    this._clearLoadingStatusTimer();
    this._mediaStatus = JuiAudioStatus.PAUSE;
    onPlay && onPlay();
  };

  @action
  private _onPause = () => {
    const { onPaused } = this.props;
    this._clearLoadingStatusTimer();
    this._mediaStatus = JuiAudioStatus.PLAY;
    onPaused && onPaused();
  };

  @action
  private _onTimeUpdate = () => {
    const { onTimeUpdate } = this.props;
    const currentTime = (this._media && this._media.currentTime) || 0;
    this._currentTime = currentTime;
    onTimeUpdate && onTimeUpdate(currentTime);
  };

  @action
  private _onEnded = () => {
    const { onEnded } = this.props;
    this._mediaStatus = JuiAudioStatus.PLAY;
    this._currentTime = 0;
    onEnded && onEnded();
  };

  @action
  private _onError = () => {
    const { onError } = this.props;
    this._clearLoadingStatusTimer();
    this._mediaStatus = JuiAudioStatus.RELOAD;
    this._currentTime = 0;
    onError && onError();
  };

  @action
  private _loadingStatusTimer = () => {
    this._loadingTimer = setTimeout(() => {
      if (this._media && this._media.playing) {
        return;
      }
      this._mediaStatus = JuiAudioStatus.LOADING;
    }, LOADING_TIME);
  };

  private _clearLoadingStatusTimer = () => {
    clearTimeout(this._loadingTimer);
  };

  @computed
  get mediaStatus() {
    return this._mediaStatus;
  }

  @computed
  get currentTime() {
    const { startTime } = this.props;
    return typeof startTime !== 'undefined' ? startTime : this._currentTime;
  }

  @computed
  get currentDuration() {
    return this._currentDuration;
  }
}

export { AudioPlayerViewModel };
