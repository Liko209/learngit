/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:36:36
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../foundation/styled-components';
import { width, height } from '../../foundation/utils';

export type PresenceProps = {
  presence?: 'online' | 'away' | 'offline' | 'default';
} & React.HTMLAttributes<HTMLDivElement>;

const PRESENCE_COLOR_MAP = {
  online: '#4cd964',
  away: '#ffd800',
  offline: '#c7c7c7',
  default: 'transparent',
};

const StyledPresence = styled<PresenceProps, 'div'>('div')`
  display: inline-block;
  width: ${width(2)};
  height: ${height(2)};
  margin: 6px;
  background: ${props => PRESENCE_COLOR_MAP[props.presence || 'default']};
  border-radius: 50%;
`;

const JuiPresence = (props: PresenceProps) => <StyledPresence {...props} />;

export { JuiPresence };
export default JuiPresence;
