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
import { Palette } from '../../../foundation/theme/theme';

type Props = {
  icon: string;
  callType: string;
  duration: string;
  isMissedCall: boolean;
  isShowCallInfo: boolean;
};

const CallLogStatus = (props: Props) => {
  const { icon, callType, duration, isMissedCall, isShowCallInfo } = props;
  const color: IconColor = isMissedCall
    ? ['accent', 'tomato']
    : ['grey', '600'];

  const textColor: [keyof Palette, string] = isMissedCall
    ? ['accent', 'tomato']
    : ['grey', '900'];

  return (
    <ContactItem disableButton={true} isUnread={false}>
      <JuiListItemAvatar>
        <JuiIconography iconSize="medium" iconColor={color}>
          {icon}
        </JuiIconography>
      </JuiListItemAvatar>
      {isShowCallInfo && (
        <JuiListItemText
          alignCenter={true}
          primary={callType}
          primaryColor={textColor}
          secondary={isMissedCall ? null : duration}
        />
      )}
    </ContactItem>
  );
};

const StyledCallLogStatusWrapper = styled.div`
  flex: 1;
  max-width: 25%;
  width: 25%;
  && li:first-child {
    margin-left: 25%;
  }
`;

export { CallLogStatus, StyledCallLogStatusWrapper };
