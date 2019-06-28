/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-01 14:56:34
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import {
  StyledTime,
  StyleVoicemailItem,
  VoicemailSummary,
  StyledAudioPlayerWrapper,
  StyledContactWrapper,
  // StyledVoicemailDetail,
} from 'jui/pattern/Phone/VoicemailItem';
import { JuiAudioPlayer } from 'jui/pattern/AudioPlayer';
import { Actions } from '../Actions';
import { ContactInfo } from '../ContactInfo';
import { VoicemailViewProps, JuiAudioMode } from './types';
import { ENTITY_TYPE, MAX_BUTTON_COUNT } from '../constants';

type VoicemailItemProps = VoicemailViewProps & WithTranslation & { id: number };
type State = {
  isHover: boolean;
};

@observer
class VoicemailViewComponent extends Component<VoicemailItemProps, State> {
  private _AudioPlayer = React.createRef<JuiAudioPlayer>();

  state = {
    isHover: false,
  };

  get playerMode() {
    const { isHover } = this.state;
    const { isAudioActive } = this.props;

    return isHover || isAudioActive ? JuiAudioMode.FULL : JuiAudioMode.MINI;
  }

  componentDidUpdate() {
    const { selected, shouldPause } = this.props;
    if ((!selected || shouldPause) && this._AudioPlayer.current) {
      this._AudioPlayer.current.pause();
    }
  }

  componentWillUnmount() {
    if (this._AudioPlayer.current) {
      this._AudioPlayer.current.pause();
    }
  }

  handleMouseOver = () => {
    this.setState({ isHover: true });
  }

  handleMouseLeave = () => {
    this.setState({ isHover: false });
  }

  private _getTips() {
    const { t } = this.props;
    return {
      play: t('common.play'),
      pause: t('common.pause'),
      reload: t('common.reload'),
    };
  }

  private _getLabels() {
    const { t } = this.props;
    return {
      play: t('voicemail.labels.play'),
      pause: t('voicemail.labels.pause'),
      reload: t('voicemail.labels.reload'),
    };
  }

  render() {
    const {
      id,
      caller,
      readStatus,
      isUnread,
      audio,
      onError,
      onBeforePlay,
      onBeforeAction,
      updateStartTime,
      createTime,
      direction,
      canEditBlockNumbers,
      // onChange,
      // selected,
    } = this.props;
    const { isHover } = this.state;

    return (
      // <StyleVoicemailItem expanded={selected} onChange={onChange}>
      <StyleVoicemailItem
        data-id={id}
        data-test-automation-class="voicemail-item"
        expanded={false}
      >
        <VoicemailSummary
          isUnread={isUnread}
          onMouseOver={this.handleMouseOver}
          onMouseLeave={this.handleMouseLeave}
        >
          <StyledContactWrapper>
            <ContactInfo
              caller={caller}
              readStatus={readStatus}
              direction={direction}
              isMissedCall={true}
            />
          </StyledContactWrapper>
          {audio && (
            <StyledAudioPlayerWrapper>
              <JuiAudioPlayer
                ref={this._AudioPlayer}
                onBeforePlay={onBeforePlay}
                onBeforeAction={onBeforeAction}
                onTimeUpdate={updateStartTime}
                onError={onError}
                mode={this.playerMode}
                isHighlight={isUnread}
                src={audio.downloadUrl}
                duration={audio.vmDuration}
                // should be improve
                // audio player should support set startTime function
                startTime={audio.startTime}
                actionTips={this._getTips()}
                actionLabels={this._getLabels()}
              />
            </StyledAudioPlayerWrapper>
          )}
          {!isHover && (
            <StyledTime data-test-automation-id={`voicemail-${id}-time`}>
              {createTime}
            </StyledTime>
          )}
          {isHover && (
            <Actions
              id={id}
              caller={caller}
              entity={ENTITY_TYPE.VOICEMAIL}
              maxButtonCount={MAX_BUTTON_COUNT}
              hookAfterClick={this.handleMouseLeave}
              canEditBlockNumbers={canEditBlockNumbers}
            />
          )}
        </VoicemailSummary>
        {/* <StyledVoicemailDetail> */}
        {/* <p>TODO show detail</p> */}
        {/* </StyledVoicemailDetail> */}
      </StyleVoicemailItem>
    );
  }
}

const VoicemailItemView = withTranslation('translations')(
  VoicemailViewComponent,
);

export { VoicemailItemView };
