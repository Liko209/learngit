import React from 'react';
import styled from 'styled-components';
import { WithTheme } from '@material-ui/core';

export type PresenceProps = {
  presence?: 'online' | 'away' | 'offline' | 'default';
} & Partial<Pick<WithTheme, 'theme'>> & React.HTMLAttributes<HTMLDivElement>;

const PRESENCE_COLOR_MAP = {
  online: '#4cd964',
  away: '#ffd800',
  offline: '#c7c7c7',
  default: 'transparent',
};

const Presence = styled<PresenceProps, 'div'>('div')`
  width: 8px;
  height: 8px;
  margin: 6px 8px;
  background: ${props => PRESENCE_COLOR_MAP[props.presence || 'default']};
  border-radius: 50%;
`;

const AvatarPresence = Presence.extend`
  position: absolute;
  right: -2px;
  bottom: -1px;
  border: 2px solid #fff;
  z-index: 10;
  margin: 0;
`;

export { Presence, AvatarPresence };
export default { Presence };
