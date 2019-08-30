/*
 * @Author: isaac.liu
 * @Date: 2019-06-03 14:44:12
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import {
  StyledContactWrapper,
  StyleVoicemailItem,
  VoicemailSummary,
  StyledTime,
  StyledActionWrapper,
} from 'jui/pattern/Phone/VoicemailItem';
import { ContactInfo } from '../ContactInfo';
import { CallLogItemViewProps, CallLogItemProps } from './types';
import { READ_STATUS } from 'sdk/module/RCItems/constants';
import {
  CallLogStatus,
  StyledCallLogStatusWrapper,
} from 'jui/pattern/Phone/CallLog';
import { Actions } from '../Actions';
import { ENTITY_TYPE } from '../constants';
import { getCreateTime } from '@/utils/date';

type Props = CallLogItemViewProps & CallLogItemProps;

@observer
class CallLogItemView extends Component<Props> {
  render() {
    const {
      id,
      isUnread,
      isPseudo,
      caller,
      icon,
      callType,
      duration,
      startTime,
      didOpenMiniProfile,
      isMissedCall,
      direction,
      canEditBlockNumbers,
      isHover,
      onMouseOver,
      onMouseLeave,
      callLogResponsiveMap,
    } = this.props;

    return (
      <StyleVoicemailItem
        data-id={id}
        data-test-automation-class="call-history-item"
        expanded={false}
      >
        <VoicemailSummary
          isUnread={isUnread}
          expanded={false}
          onMouseOver={onMouseOver}
          onMouseLeave={onMouseLeave}
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
              isShowCallInfo={callLogResponsiveMap.showCallInfo}
              icon={icon}
              callType={callType}
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
                isPseudo={isPseudo}
                maxButtonCount={callLogResponsiveMap.buttonToShow}
                canEditBlockNumbers={canEditBlockNumbers}
              />
            </StyledActionWrapper>
          ) : (
            <StyledTime>
              {getCreateTime(startTime, callLogResponsiveMap.dateFormat)}
            </StyledTime>
          )}
        </VoicemailSummary>
      </StyleVoicemailItem>
    );
  }
}

export { CallLogItemView };
