/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-11-22 15:45:22
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import MuiSnackbarContent, {
  SnackbarContentProps,
} from '@material-ui/core/SnackbarContent';

import { spacing, palette, grey } from '../../foundation/utils/styles';
import { MessageAlignment, SnackbarContentColor } from './SnackbarContent';

import styled from '../../foundation/styled-components';
type JuiSnackbarContentProps = {
  messageAlign: MessageAlignment;
  bgColor: SnackbarContentColor;
  radius: number;
} & SnackbarContentProps;

const WrapperContent = ({
  messageAlign,
  bgColor,
  radius,
  ...rest
}: JuiSnackbarContentProps) => <MuiSnackbarContent {...rest} />;

const SnackbarContent = styled<JuiSnackbarContentProps>(WrapperContent)`
  && {
    padding: ${spacing(2, 6)};
    color: ${grey('900')};
    background: ${({ bgColor }) => palette(bgColor[0], bgColor[1], 1)};
    box-shadow: none;
    width: 100% !important;
    border-radius: ${props => props.radius} !important;
    max-width: 100% !important;
    box-sizing: border-box;
  }
  .message {
    display: "flex";
    text-align: ${props => props.messageAlign};
  }
`;

export { SnackbarContent };
