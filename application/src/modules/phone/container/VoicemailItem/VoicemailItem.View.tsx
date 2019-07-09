/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-01 14:56:34
 * Copyright © RingCentral. All rights reserved.
 */
/* eslint-disable */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import {
  StyledTime,
  StyleVoicemailItem,
  VoicemailSummary,
  StyledAudioPlayerWrapper,
  StyledContactWrapper,
  StyledActionWrapper,
  // StyledVoicemailDetail,
} from 'jui/pattern/Phone/VoicemailItem';
import { JuiAudioPlayer } from 'jui/pattern/AudioPlayer';
import { Actions } from '../Actions';
import { ContactInfo } from '../ContactInfo';
import {
  VoicemailViewProps,
  VoicemailProps,
  JuiAudioMode,
  ResponsiveObject,
} from './types';
import { ENTITY_TYPE } from '../constants';
import { getCreateTime } from '@/utils/date';

type VoicemailItemProps = VoicemailViewProps &
  VoicemailProps &
  WithTranslation & { id: number; voiceMailResponsiveMap: ResponsiveObject };

type State = {
  showCall: boolean;
};

@observer
class VoicemailViewComponent extends Component<VoicemailItemProps, State> {
  private _AudioPlayer = React.createRef<JuiAudioPlayer>();

  state = {
    showCall: false,
  };

  async componentDidMount() {
    const { shouldShowCall } = this.props;
    if (shouldShowCall) {
      const showCall = await shouldShowCall();
      this.setState({
        showCall,
      });
    }
  }

  get playerMode() {
    const {
      isHover,
      isAudioActive,
      voiceMailResponsiveMap: voiceMailResponsiveMap,
    } = this.props;

    if (voiceMailResponsiveMap.audioMode === JuiAudioMode.FULL) {
      return isHover || isAudioActive ? JuiAudioMode.FULL : JuiAudioMode.MINI;
    }
    return voiceMailResponsiveMap.audioMode;
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
      onMouseOver,
      onMouseLeave,
      isHover,
      voiceMailResponsiveMap: voiceMailResponsiveMap,
      // onChange,
      // selected,
    } = this.props;
    const { showCall } = this.state;

    return (
      // <StyleVoicemailItem expanded={selected} onChange={onChange}>
      <StyleVoicemailItem
        data-id={id}
        data-test-automation-class='voicemail-item'
        expanded={false}
      >
        <VoicemailSummary
          isUnread={isUnread}
          onMouseLeave={onMouseLeave}
          onMouseOver={onMouseOver}
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
                responsiveSize={voiceMailResponsiveMap}
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
              {getCreateTime(createTime, voiceMailResponsiveMap.dateFormat)}
            </StyledTime>
          )}
          {isHover && (
            <StyledActionWrapper>
              <Actions
                id={id}
                caller={caller}
                entity={ENTITY_TYPE.VOICEMAIL}
                maxButtonCount={voiceMailResponsiveMap.buttonToShow}
                canEditBlockNumbers={canEditBlockNumbers}
                showCall={showCall}
              />
            </StyledActionWrapper>
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
