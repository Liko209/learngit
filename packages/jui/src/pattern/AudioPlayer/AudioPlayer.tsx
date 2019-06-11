/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-05-27 10:00:00
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../foundation/styled-components';
import { JuiAudioAction } from './AudioAction';
import { JuiAudioProgress } from './AudioProgress';
import {
  JuiAudioMode,
  JuiAudioColor,
  JuiAudioStatus,
  IJuiAudioAction,
  IJuiGetAudioColor,
  JuiAudioPlayerProps,
  IJuiAudioProgressChange,
} from './types';

const StyledPlayerWrapper = styled.div`
  display: inline-flex;
  align-items: center;
`;

const getActionColor: IJuiGetAudioColor = (status, isHighlight) => {
  const isReload = Object.is(status, JuiAudioStatus.RELOAD);

  if (isReload) {
    return JuiAudioColor.ERROR;
  }

  const isPrimary = isHighlight || Object.is(status, JuiAudioStatus.PAUSE);

  return isPrimary ? JuiAudioColor.PRIMARY : JuiAudioColor.DEFAULT;
};

type State = {
  status: JuiAudioStatus;
  timestamp: number;
  timestampLock: boolean;
};

const START = 0;
const DELAY_START_TIME = 100;
const LOADING_TIME = 150;

class JuiAudioPlayer extends React.PureComponent<JuiAudioPlayerProps, State> {
  private _audio = new Audio();
  private _currentSrc: string;
  private _loadingTimer: NodeJS.Timer;

  constructor(props: JuiAudioPlayerProps) {
    super(props);

    const { startTime = 0, duration } = props;

    this.state = {
      status: JuiAudioStatus.PLAY,
      timestamp: Math.min(startTime, duration),
      timestampLock: false,
    };

    this.initAudioPlayer();
  }

  componentWillUnmount() {
    this._dispose();
  }

  initAudioPlayer = () => {
    this._audio.preload = 'none';
    this._audio.onerror = this._onError;
    this._audio.onplay = this._onPlay;
    this._audio.onended = this._onEnded;
    this._audio.onplaying = this._onPlaying;
    this._audio.ontimeupdate = this._onTimeUpdate;
  }

  private _onPlaying = () => {
    const { status } = this.state;
    if (this._loadingTimer) {
      clearTimeout(this._loadingTimer);
    }

    if (status === JuiAudioStatus.LOADING) {
      this.setState({ status: JuiAudioStatus.PAUSE });
    }
  }

  private _onError = () => {
    if (this._loadingTimer) {
      clearTimeout(this._loadingTimer);
    }
    const { onError } = this.props;

    this._currentSrc = '';
    onError && onError();
    this.setState({ status: JuiAudioStatus.RELOAD });
  }

  private _onEnded = () => {
    const { onEnded, duration, onTimeUpdate } = this.props;

    this.setState({ timestamp: duration }, () => {
      // we need focus to end and delay to start
      // example video only 0.6s slider will reset in 60%
      setTimeout(() => {
        this.setState({
          status: JuiAudioStatus.PLAY,
          timestamp: START,
        });
        onTimeUpdate && onTimeUpdate(START);
      },         DELAY_START_TIME);
    });
    onEnded && onEnded();
  }

  private _onDragStart = () => {
    this.setState({ timestampLock: true });
  }

  private _onDragEnd = () => {
    const { timestamp } = this.state;
    const { onTimeUpdate } = this.props;

    this.setState({ timestampLock: false });

    this._audio.currentTime = timestamp;
    onTimeUpdate && onTimeUpdate(timestamp);
  }

  private _onTimestampChange: IJuiAudioProgressChange = (event, timestamp) => {
    this.setState({ timestamp });
  }

  private _onAction: IJuiAudioAction = (status: JuiAudioStatus) => {
    const { onBeforeAction } = this.props;
    onBeforeAction && onBeforeAction(status);
    this[status]();
  }

  private _onTimeUpdate = () => {
    const { timestampLock } = this.state;
    const { onTimeUpdate } = this.props;
    const timestamp = this._audio.currentTime;

    if (!timestampLock) {
      this.setState({ timestamp });

      onTimeUpdate && onTimeUpdate(timestamp);
    }
  }

  private _onPlay = () => {
    this._audio.currentTime = this.state.timestamp;
    this._loadingTimer = setTimeout(() => {
      this.setState({ status: JuiAudioStatus.LOADING });
    },                              LOADING_TIME);

    this.setState({ status: JuiAudioStatus.PAUSE });
  }

  play = () => {
    const { src, onBeforePlay } = this.props;

    onBeforePlay && onBeforePlay();
    // if will play link is http://www.google.com:80
    // audio.src will is http://www.google.com  ignore 80
    // so we cache current play src till src change
    // and set new src again
    if (this._currentSrc !== src) {
      this._audio.src = src;
      this._currentSrc = src;
    }

    if (this._audio.src) {
      this._audio.play();
    }
  }

  pause = () => {
    this._audio.pause();

    this.setState({ status: JuiAudioStatus.PLAY });
  }

  reload = () => {
    const { timestamp } = this.state;

    this._audio.load();

    this._audio.currentTime = timestamp;

    this.play();
  }

  private _dispose() {
    this._audio.onerror = null;
    this._audio.onplay = null;
    this._audio.onended = null;
    this._audio.ontimeupdate = null;
    this._audio.oncanplay = null;

    delete this._audio;
  }

  render() {
    const { status, timestamp } = this.state;

    const {
      duration,
      actionTips,
      actionLabels,
      mode = JuiAudioMode.FULL,
      isHighlight = false,
    } = this.props;

    return (
      <StyledPlayerWrapper>
        <JuiAudioAction
          color={getActionColor(status, isHighlight)}
          status={status}
          tooltip={actionTips[status]}
          label={actionLabels[status]}
          onAction={this._onAction}
        />
        <JuiAudioProgress
          mode={mode}
          duration={duration}
          value={timestamp}
          onChange={this._onTimestampChange}
          onDragStart={this._onDragStart}
          onDragEnd={this._onDragEnd}
        />
      </StyledPlayerWrapper>
    );
  }
}

export { JuiAudioPlayer };
