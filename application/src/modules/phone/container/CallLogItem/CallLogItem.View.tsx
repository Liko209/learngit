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
};

@observer
class CallLogItemViewComponent extends Component<Props, State> {
  state = {
    isHover: false,
  };

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
    } = this.props;
    const {
      isHover,
    } = this.state;

    return (
      <StyleVoicemailItem expanded={false}>
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
              icon={icon}
              callType={t(callType)}
              duration={duration}
              isMissedCall={isMissedCall}
            />
          </StyledCallLogStatusWrapper>
          <StyledTime>{startTime}</StyledTime>
          {isHover && (
            <Actions
              id={id}
              entity={ENTITY_TYPE.CALL_LOG}
              hookAfterClick={this.handleMouseLeave}
            />
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
