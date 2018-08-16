import React from 'react';
import styled from 'styled-components';
import { WithTheme } from '@material-ui/core';

export type PresenceProps = {
  status?: string;
} & Partial<Pick<WithTheme, 'theme'>> & React.HTMLAttributes<HTMLDivElement>;

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
  background: ${props => PRESENCE_COLOR_MAP[props.status || 'default']};
  border-radius: 50%;
`;

const Presence = (props: PresenceProps) => <StyledPresence {...props} />;

export { Presence };
export default Presence;
