/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:36:36
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../foundation/styled-components';
import { height, width, palette, grey } from '../../foundation/utils';

export type JuiPresenceProps = {
  presence?:
    | 'Unavailable'
    | 'Available'
    | 'OnCall'
    | 'DND'
    | 'NotReady'
    | 'InMeeting';
  size?: 'small' | 'medium' | 'large' | 'profile';
} & React.HTMLAttributes<HTMLDivElement>;

const sizes = {
  small: 2,
  medium: 2,
  large: 2.5,
  profile: 4,
};

const borderSizes = {
  small: 1,
  medium: 2,
  large: 2,
  profile: 3,
};

const PRESENCE_COLOR_MAP = {
  Available: 'positive',
  OnCall: 'negative',
  InMeeting: 'negative',
  Unavailable: 'gray400',
  DND: 'negative',
  NotReady: 'gray400',
};

const StyledPresence = styled<JuiPresenceProps, 'div'>('div')`
  display: inline-block;
  width: ${props => width(sizes[props.size || 'medium'])};
  height: ${props => height(sizes[props.size || 'medium'])};
  border: ${props => borderSizes[props.size || 'medium']}px solid
    ${palette('common', 'white')};
  /* margin: 6px 8px; */
  background: ${props =>
    PRESENCE_COLOR_MAP[props.presence || 'NotReady'] === 'gray400'
      ? grey('400')
      : palette('semantic', PRESENCE_COLOR_MAP[props.presence || 'NotReady'])};
  border-radius: 50%;
`;

const JuiPresence = (props: JuiPresenceProps) => {
  return <StyledPresence {...props} />;
};

export { JuiPresence };
export default JuiPresence;
