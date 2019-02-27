/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-16 10:46:08
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import MuiSnackbarContent, {
  SnackbarContentProps,
} from '@material-ui/core/SnackbarContent';

import styled from '../../foundation/styled-components';
import { spacing, palette, grey } from '../../foundation/utils/styles';
import { JuiIconography } from '../../foundation/Iconography';
import { SnackbarContentColor } from './SnackbarContent';

type JuiSnackbarContentProps = {
  bgColor: SnackbarContentColor;
} & SnackbarContentProps;

type JuiSnackbarIcon = {
  color: SnackbarContentColor;
  children: string;
};

const WrapperSnackbarIcon = ({ color, ...rest }: JuiSnackbarIcon) => (
  <JuiIconography {...rest} />
);

const SnackbarIcon = styled<JuiSnackbarIcon>(WrapperSnackbarIcon)`
  margin: ${spacing(0, 2, 0, 0)};
  color: ${({ color }) => palette(...color)};
`;

const WrapperContent = ({ bgColor, ...rest }: JuiSnackbarContentProps) => (
  <MuiSnackbarContent {...rest} />
);

const SnackbarContent = styled<JuiSnackbarContentProps>(WrapperContent)`
  && {
    padding: ${spacing(2, 6)};
    color: ${grey('900')};
    background: ${({ bgColor }) => palette(bgColor[0], bgColor[1], 1)};
    box-shadow: none;
    width: 100% !important;
    border-radius: 0 !important;
    max-width: 100% !important;
    box-sizing: border-box;
  }
  .message {
    padding: 0;
  }
`;

const MessageWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export { SnackbarContent, MessageWrapper, SnackbarIcon };
