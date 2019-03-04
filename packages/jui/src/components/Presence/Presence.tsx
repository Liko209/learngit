/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:36:36
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo } from 'react';
import styled from '../../foundation/styled-components';
import { height, width, palette } from '../../foundation/utils';
import { Palette } from '../../foundation/theme/theme';

export enum PRESENCE {
  NOTREADY = 'NotReady',
  UNAVAILABLE = 'Unavailable',
  AVAILABLE = 'Available',
  ONCALL = 'OnCall',
  DND = 'DND',
  INMEETING = 'InMeeting',
}

export type JuiPresenceProps = {
  presence: PRESENCE;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  borderSize?: 'small' | 'medium' | 'large' | 'xlarge';
} & React.HTMLAttributes<HTMLDivElement>;

const sizes = {
  small: 2,
  medium: 2,
  large: 2.5,
  xlarge: 3.5,
};

const borderSizes = {
  small: 1,
  medium: 2,
  large: 2,
  xlarge: 3,
};

const presenceSizes = {
  small: [1, 0.5],
  medium: [1.5, 0.5],
  large: [1.5, 0.5],
  xlarge: [2.5, 1],
};

const PRESENCE_COLOR_MAP = {
  Available: 'semantic.positive',
  OnCall: 'semantic.negative',
  InMeeting: 'semantic.negative',
  Unavailable: 'grey.400',
  DND: 'semantic.negative',
  NotReady: 'grey.400',
};

const getColor = (value: string) => {
  let colorScope: keyof Palette = 'primary';
  let colorName: string = 'main';
  if (value && value.indexOf('.') >= 0) {
    const arr = value.split('.');
    if (arr.length > 1) {
      colorScope = arr[0] as keyof Palette;
      colorName = arr[1];
    } else {
      colorScope = arr[0] as keyof Palette;
      colorName = 'main';
    }
  }

  return palette(colorScope, colorName);
};

const StyledPresence = styled<JuiPresenceProps, 'div'>('div')`
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${props => width(sizes[props.size || 'medium'])};
  height: ${props => height(sizes[props.size || 'medium'])};
  border: ${props => props.borderSize && borderSizes[props.borderSize]}px solid
    ${palette('common', 'white')};
  background: ${props =>
    getColor(PRESENCE_COLOR_MAP[props.presence || PRESENCE.NOTREADY])};
  border-radius: 50%;
`;

const StyledDiv = styled<JuiPresenceProps, 'div'>('div')`
  width: ${props => width(presenceSizes[props.size || 'medium'][0])};
  height: ${props => height(presenceSizes[props.size || 'medium'][1])};
  background: ${palette('common', 'white')};
`;

const JuiPresence = memo((props: JuiPresenceProps) => {
  return (
    <StyledPresence {...props}>
      {props.presence === PRESENCE.DND ? <StyledDiv {...props} /> : null}
    </StyledPresence>
  );
});

export { JuiPresence };
export default JuiPresence;
