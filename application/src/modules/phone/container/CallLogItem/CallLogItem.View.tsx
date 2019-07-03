/*
 * @Author: isaac.liu
 * @Date: 2019-06-03 14:44:12
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import {
  StyledContactWrapper,
  StyleVoicemailItem,
  VoicemailSummary,
  StyledTime,
  StyledActionWrapper,
} from 'jui/pattern/Phone/VoicemailItem';
import { ContactInfo } from '../ContactInfo';
import { CallLogItemViewProps } from './types';
import { READ_STATUS } from 'sdk/module/RCItems/constants';
import {
  CallLogStatus,
  StyledCallLogStatusWrapper,
} from 'jui/pattern/Phone/CallLog';
import { Actions } from '../Actions';
import { ENTITY_TYPE } from '../constants';

type Props = CallLogItemViewProps & WithTranslation;

type State = {
  isHover: boolean;
  showCall: boolean;
};

@observer
class CallLogItemViewComponent extends Component<Props, State> {
  state = {
    isHover: false,
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

  handleMouseOver = () => {
    this.setState({ isHover: true });
  }

  handleMouseLeave = () => {
    this.setState({ isHover: false });
  }

  render() {
    const {
      t,
      id,
      isUnread,
      caller,
      icon,
      callType,
      duration,
      startTime,
      didOpenMiniProfile,
      isMissedCall,
      direction,
      canEditBlockNumbers,
      callLogResponsiveMap,
    } = this.props;
    const { isHover, showCall } = this.state;

    return (
      <StyleVoicemailItem
        data-id={id}
        data-test-automation-class="call-history-item"
        expanded={false}
      >
        <VoicemailSummary
          isUnread={isUnread}
          expanded={false}
          onMouseOver={this.handleMouseOver}
          onMouseLeave={this.handleMouseLeave}
        >
          <StyledContactWrapper>
            <ContactInfo
              caller={caller}
              readStatus={isUnread ? READ_STATUS.UNREAD : READ_STATUS.READ}
              didOpenMiniProfile={didOpenMiniProfile}
              isMissedCall={isMissedCall}
              direction={direction}
            />
          </StyledContactWrapper>
          <StyledCallLogStatusWrapper>
            <CallLogStatus
              isShowCallInfo={callLogResponsiveMap.ShowCallInfo}
              icon={icon}
              callType={t(callType)}
              duration={duration}
              isMissedCall={isMissedCall}
            />
          </StyledCallLogStatusWrapper>
          {isHover ? (
            <StyledActionWrapper>
              <Actions
                id={id}
                caller={caller}
                entity={ENTITY_TYPE.CALL_LOG}
                maxButtonCount={callLogResponsiveMap.ButtonToShow}
                hookAfterClick={this.handleMouseLeave}
                canEditBlockNumbers={canEditBlockNumbers}
                showCall={showCall}
              />
            </StyledActionWrapper>
          ) : (
            <StyledTime>{startTime}</StyledTime>
          )}
        </VoicemailSummary>
      </StyleVoicemailItem>
    );
  }
}

const CallLogItemView = withTranslation('translations')(
  CallLogItemViewComponent,
);

export { CallLogItemView };
