/*
 * @Author: isaac.liu
 * @Date: 2019-06-04 13:17:29
 * Copyright © RingCentral. All rights reserved.
 */
/*
 * @Author: isaac.liu
 * @Date: 2019-06-03 14:44:12
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiListItemAvatar, JuiListItemText } from '../../../components/Lists';
import { ContactItem } from '../../ContactInfo';
import { JuiIconography, IconColor } from '../../../foundation/Iconography';
import styled from '../../../foundation/styled-components';

type Props = {
  isUnread: boolean;
  icon: string;
  callType: string;
  duration: string;
  isMissedCall: boolean;
};

const CallLogStatus = (props: Props) => {
  const { isUnread, icon, callType, duration, isMissedCall } = props;
  const color: IconColor = isMissedCall
    ? ['accent', 'tomato']
    : ['grey', '600'];
  return (
    <ContactItem disableButton={true} isUnread={isUnread}>
      <JuiListItemAvatar>
        <JuiIconography iconSize="medium" iconColor={color}>
          {icon}
        </JuiIconography>
      </JuiListItemAvatar>
      <JuiListItemText
        alignCenter={true}
        primary={callType}
        secondary={duration}
      />
    </ContactItem>
  );
};

const StyledCallLogStatusWrapper = styled.div`
  flex: 1;
`;

export { CallLogStatus, StyledCallLogStatusWrapper };
