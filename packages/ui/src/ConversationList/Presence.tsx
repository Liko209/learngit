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

const Presence = styled<PresenceProps, 'div'>('div')`
  width: 8px;
  height: 8px;
  margin: 6px 8px;
  background: ${({ status }: PresenceProps) => PRESENCE_COLOR_MAP[status || 'default']};
  border-radius: 50%;
`;

export { Presence };
export default { Presence };
