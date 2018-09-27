/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:37:19
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import MuiDivider, {
  DividerProps as MuiDividerProps,
} from '@material-ui/core/Divider';
import styled from '../../foundation/styled-components';
import { grey } from '../../foundation/utils/styles';
import { Omit } from '../../foundation/utils/typeHelper';

type JuiDividerProps = Omit<MuiDividerProps, 'innerRef'> &
  React.HTMLAttributes<HTMLHRElement>;

const JuiDivider = styled<JuiDividerProps>(MuiDivider)`
  && {
    background-color: ${grey('300')};
  }
`;

JuiDivider.displayName = 'JuiDivider';
JuiDivider.dependencies = [MuiDivider];

export { JuiDividerProps, JuiDivider };
