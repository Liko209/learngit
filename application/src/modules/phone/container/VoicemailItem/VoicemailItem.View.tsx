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
  StyledActionWrapper,
  // StyledVoicemailDetail,
} from 'jui/pattern/Phone/VoicemailItem';
import { Actions } from '../Actions';
import { ContactInfo } from '../ContactInfo';
import {
  VoicemailViewProps,
  VoicemailProps,
  JuiAudioMode,
  ResponsiveObject,
} from './types';
import { ENTITY_TYPE } from '../constants';
import { AudioPlayer } from '@/modules/media/container/AudioPlayer';

import { getCreateTime } from '@/utils/date';

type VoicemailItemProps = VoicemailViewProps &
  VoicemailProps &
  WithTranslation & { id: number; voiceMailResponsiveMap: ResponsiveObject };

type State = {
  showCall: boolean;
};

@observer
class VoicemailViewComponent extends Component<VoicemailItemProps, State> {
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
    const { isHover, showFullAudioPlayer, voiceMailResponsiveMap } = this.props;

    if (voiceMailResponsiveMap.audioMode === JuiAudioMode.FULL) {
      return isHover || showFullAudioPlayer
        ? JuiAudioMode.FULL
        : JuiAudioMode.MINI;
    }
    return voiceMailResponsiveMap.audioMode;
  }

  render() {
    const {
      id,
      caller,
      readStatus,
      isUnread,
      audio,
      onPlay,
      onPaused,
      onError,
      onEnded,
      onBeforePlay,
      updateStartTime,
      createTime,
      direction,
      canEditBlockNumbers,
      onMouseOver,
      onMouseLeave,
      isHover,
      voiceMailResponsiveMap,
      // onChange,
      // selected,
    } = this.props;
    const { showCall } = this.state;

    return (
      // <StyleVoicemailItem expanded={selected} onChange={onChange}>
      <StyleVoicemailItem
        data-id={id}
        data-test-automation-class="voicemail-item"
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
              isMissedCall
            />
          </StyledContactWrapper>
          {audio && (
            <StyledAudioPlayerWrapper>
              <AudioPlayer
                autoDispose={false}
                id={id.toString()}
                media={audio.media}
                src={audio.downloadUrl}
                duration={audio.vmDuration}
                mode={this.playerMode}
                isHighlight={isUnread}
                onBeforePlay={onBeforePlay}
                onTimeUpdate={updateStartTime}
                onPlay={onPlay}
                onPaused={onPaused}
                onError={onError}
                onEnded={onEnded}
                startTime={audio.startTime}
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
