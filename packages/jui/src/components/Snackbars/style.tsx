/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-11-22 15:45:22
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import MuiSnackbarContent, {
  SnackbarContentProps,
} from '@material-ui/core/SnackbarContent';

import styled from '../../foundation/styled-components';
import {
  spacing,
  palette,
  typography,
  width,
  height,
} from '../../foundation/utils/styles';

import { MessageAlignment, SnackbarContentColor } from './SnackbarContent';
import { JuiSnackbarAction } from './SnackbarAction';

type JuiSnackbarContentProps = {
  messageAlign: MessageAlignment;
  bgColor: SnackbarContentColor;
  fullWidth: boolean;
} & SnackbarContentProps;

const WrapperContent = ({
  messageAlign,
  bgColor,
  fullWidth,
  ...rest
}: JuiSnackbarContentProps) => <MuiSnackbarContent {...rest} />;

const SnackbarContent = styled<JuiSnackbarContentProps>(WrapperContent)`

  && {
    ${typography('body1')}
    line-height: ${height(6)};
    padding: ${spacing(3, 4)};
    overflow: hidden;
    background-color: ${({ bgColor }) => palette(bgColor[0], bgColor[1], 0)};
    box-shadow: none;
    border-radius: ${({ fullWidth, theme }) =>
      fullWidth ? 0 : `${theme.shape.borderRadius}px`} !important;
    max-width: ${props => (props.fullWidth ? '100%' : width(160))} !important;
    box-sizing: border-box;
    margin: 0 auto;
  }

  .message {
    flex: 1;
    padding: ${spacing(0)};
    text-align: ${props => props.messageAlign};
  }

  .action {
    margin-right: 0;
  }

  ${JuiSnackbarAction} + ${JuiSnackbarAction} {
    margin-left: ${spacing(3)};
  }
`;

export { SnackbarContent };
