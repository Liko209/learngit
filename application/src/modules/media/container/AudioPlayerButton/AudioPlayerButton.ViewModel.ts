/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-07-23 09:20:00
 * Copyright © RingCentral. All rights reserved.
 */

import StoreViewModel from '@/store/ViewModel';
import { AudioPlayerButtonProps } from './types';
import { MediaOptions, IMedia } from '@/interface/media';
import { observable, action, computed } from 'mobx';
import { JuiAudioStatus } from 'jui/components/AudioPlayer';
import { Media } from '../../Media';

const LOADING_TIME = 250;

class AudioPlayerButtonViewModel extends StoreViewModel<
  AudioPlayerButtonProps
> {
  @observable
  private _media: IMedia | null = null;

  @observable
  private _mediaStatus: JuiAudioStatus = JuiAudioStatus.PLAY;

  @observable
  private _isPlaying: boolean = false;

  private _currentSrc: MediaOptions['src'] = '';

  private _loadingTimer: NodeJS.Timeout;

  constructor(props: AudioPlayerButtonProps) {
    super(props);

    this.reaction(
      () => this.props.media,
      media => {
        if (media) {
          if (!(media instanceof Media)) {
            throw new Error('[AudioPlayerButton] please check media props');
          }
          if (this._media === media) {
            return;
          }
          this._media = media;
          if (this._media) {
            this._currentSrc = this._media.src;
            this._bindMediaEvent();
          }
        }
      },
      {
        fireImmediately: true,
      },
    );
  }

  playHandler = () => {
    this._playMedia();
  };

  @action
  dispose() {
    super.dispose();
    this._unbindMediaEvent();
    this._media && this._media.dispose();
  }

  private _playMedia = () => {
    if (this._currentSrc === '') {
      throw new Error('Voicemail audio source error');
    }

    if (!this._media) {
      return;
    }

    this._loadingStatusTimer();

    this._media.play({
      startTime: 0,
    });
  };

  private _bindMediaEvent = () => {
    if (!this._media) {
      return;
    }
    this._media.on('play', this._onPlay);
    this._media.on('pause', this._onPause);
    this._media.on('ended', this._onEnded);
    this._media.on('error', this._onError);
    this._media.onReset(() => {
      this._mediaStatus = JuiAudioStatus.PLAY;
      this._isPlaying = false;
    });
  };

  private _unbindMediaEvent = () => {
    if (!this._media) {
      return;
    }
    this._media.off('play', this._onPlay);
    this._media.off('pause', this._onPause);
    this._media.off('ended', this._onEnded);
    this._media.off('error', this._onError);
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

  @action
  private _onPlay = () => {
    const { onPlay } = this.props;
    this._clearLoadingStatusTimer();
    this._mediaStatus = JuiAudioStatus.PLAY;
    this._isPlaying = true;
    onPlay && onPlay();
  };

  @action
  private _onPause = () => {
    const { onPause } = this.props;
    this._clearLoadingStatusTimer();
    this._mediaStatus = JuiAudioStatus.PLAY;
    this._isPlaying = false;
    onPause && onPause();
  };

  @action
  private _onEnded = () => {
    const { onEnded } = this.props;
    this._mediaStatus = JuiAudioStatus.PLAY;
    this._isPlaying = false;
    onEnded && onEnded();
  };

  @action
  private _onError = () => {
    const { onError } = this.props;
    this._clearLoadingStatusTimer();
    this._mediaStatus = JuiAudioStatus.PLAY;
    this._isPlaying = false;
    onError && onError();
  };

  @computed
  get mediaStatus() {
    return this._mediaStatus;
  }

  @computed
  get isPlaying() {
    return this._isPlaying;
  }
}

export { AudioPlayerButtonViewModel };
