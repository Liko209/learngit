/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-07-22 16:30:00
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
  nextPlayTime: number;
  isTimeAction: boolean;
};

class JuiAudioPlayer extends React.PureComponent<JuiAudioPlayerProps, State> {
  constructor(props: JuiAudioPlayerProps) {
    super(props);
    this.state = {
      nextPlayTime: 0,
      isTimeAction: false,
    };
  }

  private _onDragStart = () => {
    const { onProcessDragged, timestamp } = this.props;
    onProcessDragged && onProcessDragged();
    this.setState({
      nextPlayTime: timestamp || 0,
      isTimeAction: true,
    });
  };

  private _onDragEnd = () => {
    const { onTimeStampChanged } = this.props;
    onTimeStampChanged && onTimeStampChanged(this.state.nextPlayTime);

    this.setState({
      isTimeAction: false,
    });
  };

  private _onTimestampChange: IJuiAudioProgressChange = (event, timestamp) => {
    this.setState({
      nextPlayTime: timestamp,
    });
  };

  private _getCurrentTime = () =>
    this.state.isTimeAction
      ? this.state.nextPlayTime
      : this.props.timestamp || 0;

  private _onAction: IJuiAudioAction = (status: JuiAudioStatus) => {
    const { actions } = this.props;

    switch (status) {
      case JuiAudioStatus.PLAY: {
        const playHandler = actions[JuiAudioStatus.PLAY].handler;
        playHandler && playHandler();
        break;
      }
      case JuiAudioStatus.PAUSE: {
        const pauseHandler = actions[JuiAudioStatus.PAUSE].handler;
        pauseHandler && pauseHandler();
        break;
      }
      case JuiAudioStatus.RELOAD: {
        const reloadHandler = actions[JuiAudioStatus.RELOAD].handler;
        reloadHandler && reloadHandler();
        break;
      }
      default: {
        break;
      }
    }
  };

  render() {
    const {
      duration,
      status,
      actions,
      mode = JuiAudioMode.FULL,
      isHighlight = false,
    } = this.props;

    const action = actions[status];

    return (
      <StyledPlayerWrapper>
        <JuiAudioAction
          color={getActionColor(status, isHighlight)}
          status={status}
          tooltip={action && action.tooltip}
          label={action && action.label}
          onAction={this._onAction}
        />
        <JuiAudioProgress
          status={status}
          mode={mode}
          duration={duration}
          value={this._getCurrentTime()}
          onChange={this._onTimestampChange}
          onDragStart={this._onDragStart}
          onDragEnd={this._onDragEnd}
        />
      </StyledPlayerWrapper>
    );
  }
}

export { JuiAudioPlayer };
