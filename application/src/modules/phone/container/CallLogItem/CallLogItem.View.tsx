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

type Props = CallLogItemViewProps & WithTranslation;

@observer
class CallLogItemViewComponent extends Component<Props> {
  render() {
    const {
      t,
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

    return (
      <StyleVoicemailItem expanded={false}>
        <VoicemailSummary isUnread={isUnread} expanded={false}>
          <StyledContactWrapper>
            <ContactInfo
              caller={caller}
              readStatus={READ_STATUS.READ}
              didOpenMiniProfile={didOpenMiniProfile}
              isMissedCall={isMissedCall}
              direction={direction}
            />
          </StyledContactWrapper>
          <StyledCallLogStatusWrapper>
            <CallLogStatus
              isUnread={isUnread}
              icon={icon}
              callType={t(callType)}
              duration={duration}
              isMissedCall={isMissedCall}
            />
          </StyledCallLogStatusWrapper>
          <StyledTime>{startTime}</StyledTime>
        </VoicemailSummary>
      </StyleVoicemailItem>
    );
  }
}

const CallLogItemView = withTranslation('translations')(
  CallLogItemViewComponent,
);

export { CallLogItemView };
