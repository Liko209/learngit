/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:37:19
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import MuiDivider, {
  DividerProps as MuiDividerProps,
} from '@material-ui/core/Divider';
import styled from '../../foundation/styled-components';
import { grey } from '../../foundation/utils/styles';
import { Omit } from '../../foundation/utils/typeHelper';

export type JuiDividerProps = Omit<MuiDividerProps, 'innerRef'> &
  React.HTMLAttributes<HTMLHRElement>;

export const JuiDivider = React.memo(styled<JuiDividerProps>(MuiDivider)`
  && {
    background-color: ${grey('300')};
  }
`);

JuiDivider.displayName = 'JuiDivider';
