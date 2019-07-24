/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-07-23 09:20:00
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import {
  JuiAudioPlayer,
  JuiAudioStatus,
  JuiAudioMode,
} from 'jui/components/AudioPlayer';
import { AudioPlayerButtonViewProps } from './types';
import { observer } from 'mobx-react';
import { computed } from 'mobx';

@observer
class AudioPlayerButtonViewComponent extends Component<
  AudioPlayerButtonViewProps
> {
  @computed
  private get _getAction() {
    const { t, playHandler } = this.props;

    return {
      [JuiAudioStatus.PLAY]: {
        label: t('common.play'),
        tooltip: t('common.play'),
        handler: () => {
          playHandler();
        },
      },
    };
  }

  render() {
    const { mediaStatus, isPlaying } = this.props;
    return (
      <JuiAudioPlayer
        mode={JuiAudioMode.TINY}
        status={mediaStatus}
        actions={this._getAction}
        isHighlight={isPlaying}
      />
    );
  }
}

const AudioPlayerButtonView = withTranslation('translations')(
  AudioPlayerButtonViewComponent,
);

export { AudioPlayerButtonView };
