/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-05-27 10:00:00
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from 'src/foundation/styled-components';
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

class JuiAudioPlayer extends React.Component<JuiAudioPlayerProps> {
  private _audio = new Audio();

  state = {
    status: JuiAudioStatus.PLAY,
    timestamp: 0,
    timestampLock: false,
  };

  constructor(props: JuiAudioPlayerProps) {
    super(props);

    this.initAudioPlayer();
  }

  componentWillUnmount() {
    this._dispose();
  }

  initAudioPlayer = () => {
    const { startTime = 0, duration } = this.props;

    this.state.timestamp = Math.min(startTime, duration);

    this._audio.preload = 'none';
    this._audio.onerror = this._onError;
    this._audio.onended = this._onEnded;
    this._audio.ontimeupdate = this._onTimeUpdate;
  }

  private _onError = () => {
    this.setState({ status: JuiAudioStatus.RELOAD });
  }

  private _onEnded = () => {
    const { onEnded } = this.props;

    this.setState({ status: JuiAudioStatus.PLAY, timestamp: 0 });

    onEnded && onEnded();
  }

  private _onDragStart = () => {
    this.setState({ timestampLock: true });
  }

  private _onDragEnd = () => {
    const { timestamp } = this.state;

    this.setState({ timestampLock: false });

    this._audio.currentTime = timestamp;
  }

  private _onTimestampChange: IJuiAudioProgressChange = (event, timestamp) => {
    this.setState({ timestamp });
  }

  private _onAction: IJuiAudioAction = status => this[status]();

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

    this.setState({ status: JuiAudioStatus.PAUSE });
  }

  play = () => {
    if (!this._audio.src) {
      this._audio.src = this.props.src;
    }

    this.setState({ status: JuiAudioStatus.LOADING });

    this._audio
      .play()
      .then(this._onPlay)
      .catch(this._onError);
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
    delete this._audio.onerror;
    delete this._audio.onended;
    delete this._audio.ontimeupdate;

    delete this._audio;
  }

  render() {
    const { status, timestamp } = this.state;

    const {
      duration,
      actionTips,
      mode = JuiAudioMode.FULL,
      isHighlight = false,
    } = this.props;

    return (
      <StyledPlayerWrapper>
        <JuiAudioAction
          color={getActionColor(status, isHighlight)}
          status={status}
          tooltip={actionTips[status]}
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
