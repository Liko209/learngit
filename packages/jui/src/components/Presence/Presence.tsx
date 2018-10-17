/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:36:36
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../foundation/styled-components';

export type PresenceProps = {
  presence?:
    | 'Unavailable'
    | 'Available'
    | 'OnCall'
    | 'DND'
    | 'NotReady'
    | 'InMeeting';
} & React.HTMLAttributes<HTMLDivElement>;

const PRESENCE_COLOR_MAP = {
  Available: '#4cd964',
  OnCall: '#ffd800',
  InMeeting: '#ffd800',
  Unavailable: '#c7c7c7',
  DND: '#c7c7c7',
  NotReady: '#c7c7c7',
  default: 'transparent',
};

const StyledPresence = styled<PresenceProps, 'div'>('div')`
  display: inline-block;
  width: 8px;
  height: 8px;
  margin: 6px 8px;
  background: ${props => PRESENCE_COLOR_MAP[props.presence || 'default']};
  border-radius: 50%;
`;

const JuiPresence = (props: PresenceProps) => <StyledPresence {...props} />;

export { JuiPresence };
export default JuiPresence;
