/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:36:36
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from 'styled-components';

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
  width: 8px;
  height: 8px;
  margin: 6px 8px;
  background: ${props => PRESENCE_COLOR_MAP[props.presence || 'default']};
  border-radius: 50%;
`;

const AvatarPresence = styled(StyledPresence)`
  position: absolute;
  right: -2px;
  bottom: -1px;
  border: 2px solid #fff;
  z-index: 10;
  margin: 0;
`;
const Presence = (props: PresenceProps) => <StyledPresence {...props} />;

export { Presence, AvatarPresence };
export default Presence;
