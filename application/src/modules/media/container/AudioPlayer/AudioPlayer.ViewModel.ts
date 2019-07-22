/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-07-01 15:00:00
 * Copyright © RingCentral. All rights reserved.
 */
import StoreViewModel from '@/store/ViewModel';
import { AudioPlayerProps } from './types';
import { jupiter } from 'framework';
import { MediaOptions, IMediaService, IMedia } from '@/interface/media';
import { observable, action, computed } from 'mobx';
import { JuiAudioStatus } from 'jui/pattern/AudioPlayer';
import { Media } from '../../Media';

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

  constructor(props: AudioPlayerProps) {
    super(props);

    const disposeGetMediaReaction = this.reaction(
      () => this.props.id,
      id => {
        id && !this._media && this._getMedia(id);
      },
      {
        fireImmediately: true
      }
    );
    const disposeCreateMediaReaction = this.reaction(
      () => this.props.src,
      src => {
        src && src !== this._currentSrc && !this._media && this._createMedia();
      },
      {
        fireImmediately: true
      }
    );

    this.reaction(
      () => this.props.media,
      media => {
        if (media) {
          if (!(media instanceof Media)) {
            throw new Error('[AudioPlayer] please check media props');
          }
          if (this.props.trackId) {
            console.warn(
              '[AudioPlayer] media is created outside, trackId is not working.'
            );
          }
          if (this._media === media) {
            return;
          }
          this._media = media;
          if (this._media) {
            disposeCreateMediaReaction();
            disposeGetMediaReaction();
            this._currentSrc = this._media.src;
            this._bindMediaEvent();
          }
        }
      },
      {
        fireImmediately: true
      }
    );
  }

  private get _mediaService() {
    return jupiter.get<IMediaService>(IMediaService);
  }

  private get _mediaOptions(): MediaOptions {
    const { id, src, trackId } = this.props;
    return {
      id,
      src: src || '',
      trackId
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
    this._disposeMedia();
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

  @action
  private _disposeMedia = () => {
    if (this._media) {
      this._media.stop();
      this._unbindMediaEvent();
      this._media = null;
    }
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

    const hasPropDuration = typeof duration !== 'undefined';
    const propDuration = duration as number;

    const isOutDuration = (timestamp: number, duration: number) => {
      return timestamp < 0 || Math.round(timestamp) >= duration;
    };

    const isInDuration = (timestamp: number, duration: number) => {
      return Math.round(timestamp) >= 0 && Math.round(timestamp) < duration;
    };

    if (hasMedia && hasMediaDuration) {
      if (isOutDuration(timestamp, mediaDuration)) {
        media.stop();
        this._updateTime(0);
      } else if (isInDuration(timestamp, mediaDuration)) {
        media.setCurrentTime(timestamp, this._isPlayingBefore);
        this._updateTime(timestamp);
      }
    } else if (hasMedia && !hasMediaDuration && hasPropDuration) {
      if (isOutDuration(timestamp, propDuration)) {
        media.stop();
        this._updateTime(0);
      } else if (isInDuration(timestamp, propDuration)) {
        media.setCurrentTime(timestamp, false);
        this._updateTime(timestamp);
      }
    } else if (!hasMedia && hasPropDuration) {
      if (isOutDuration(timestamp, propDuration)) {
        this._updateTime(0);
      } else if (isInDuration(timestamp, propDuration)) {
        this._updateTime(timestamp);
      }
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
    if (this._media && autoDispose) {
      this._media.pause();
      this._media.dispose();
      this._media = null;
    }
  }

  private _playMedia = async () => {
    const { onBeforePlay, onPlay, startTime } = this.props;

    this._mediaStatus = JuiAudioStatus.LOADING;

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
      startTime: startTimestamp
    });
    onPlay && onPlay();
  };

  private _pauseMedia = async () => {
    if (!this._media) {
      return;
    }

    const { onBeforePause, onPaused } = this.props;

    if (onBeforePause) {
      const isCtn = await onBeforePause();
      if (!isCtn) {
        return;
      }
    }

    this._media.pause();
    onPaused && onPaused();
  };

  private _reloadMedia = async () => {
    if (!this._media) {
      return;
    }

    const { onBeforeReload } = this.props;
    if (onBeforeReload) {
      const isCtn = await onBeforeReload();
      if (!isCtn) {
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
    this._mediaStatus = JuiAudioStatus.PAUSE;
    const { onPlay } = this.props;
    onPlay && onPlay();
  };

  @action
  private _onPause = () => {
    this._mediaStatus = JuiAudioStatus.PLAY;
    const { onPaused } = this.props;
    onPaused && onPaused();
  };

  @action
  private _onTimeUpdate = () => {
    // 当media被切换的时候，也会触发这个，这个时候的 currentTime 设置为 0
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
    this._mediaStatus = JuiAudioStatus.RELOAD;
    this._currentTime = 0;
    onError && onError();
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
