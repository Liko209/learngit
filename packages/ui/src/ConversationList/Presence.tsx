import styled from 'styled-components';
import { WithTheme } from '@material-ui/core';

export type PresenceProps = {
  status?: string;
} & Partial<Pick<WithTheme, 'theme'>>;

const PRESENCE_COLOR_MAP = {
  online: '#4cd964',
  away: '#ffd800',
  offline: '#c7c7c7',
  default: 'transparent',
};

const Presence = styled.div<PresenceProps>`
  width: 8px;
  height: 8px;
  margin: 6px 8px;
  background: ${props => PRESENCE_COLOR_MAP[props.status || 'default']};
  border-radius: 50%;
`;

export { Presence };
export default { Presence };
