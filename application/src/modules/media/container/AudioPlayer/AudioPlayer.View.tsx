/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-07-22 16:30:00
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { JuiAudioPlayer, JuiAudioStatus } from 'jui/components/AudioPlayer';
import { AudioPlayerViewProps } from './types';
import { observer } from 'mobx-react';
import { computed } from 'mobx';

@observer
class AudioPlayerViewComponent extends Component<AudioPlayerViewProps> {
  @computed
  private get _getCurrentTime() {
    const { currentTime } = this.props;
    return currentTime;
  }

  @computed
  private get _getDuration() {
    const { duration, currentDuration } = this.props;
    return currentDuration || duration;
  }

  @computed
  private get _getAction() {
    const { t, playHandler, pauseHandler, reloadHandler } = this.props;

    return {
      [JuiAudioStatus.PLAY]: {
        label: t('common.play'),
        tooltip: t('common.play'),
        handler: () => {
          playHandler();
        },
      },
      [JuiAudioStatus.PAUSE]: {
        label: t('common.pause'),
        tooltip: t('common.pause'),
        handler: () => {
          pauseHandler();
        },
      },
      [JuiAudioStatus.RELOAD]: {
        label: t('common.reload'),
        tooltip: t('common.reload'),
        handler: () => {
          reloadHandler();
        },
      },
    };
  }

  render() {
    const {
      mode,
      mediaStatus,
      isHighlight,
      dragHandler,
      timestampHandler,
    } = this.props;
    return (
      <JuiAudioPlayer
        mode={mode}
        duration={this._getDuration}
        timestamp={this._getCurrentTime}
        status={mediaStatus}
        actions={this._getAction}
        onProcessDragged={dragHandler}
        onTimeStampChanged={timestampHandler}
        isHighlight={isHighlight}
      />
    );
  }
}

const AudioPlayerView = withTranslation('translations')(
  AudioPlayerViewComponent,
);

export { AudioPlayerView };
