/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-11-22 15:45:22
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import MuiSnackbarContent, {
  SnackbarContentProps,
} from '@material-ui/core/SnackbarContent';

import { spacing, palette } from '../../foundation/utils/styles';
import { JuiButton, JuiIconButton } from '../Buttons';
import { MessageAlignment, SnackbarContentColor } from './SnackbarContent';

import styled from '../../foundation/styled-components';
type JuiSnackbarContentProps = {
  messageAlign: MessageAlignment;
  bgColor: SnackbarContentColor;
  radius: number;
  fullWidth: boolean;
} & SnackbarContentProps;

const WrapperContent = ({
  messageAlign,
  bgColor,
  radius,
  fullWidth,
  ...rest
}: JuiSnackbarContentProps) => <MuiSnackbarContent {...rest} />;

const SnackbarContent = styled<JuiSnackbarContentProps>(WrapperContent)`
  && {
    padding: ${spacing(2, 6)};
    background-color: ${({ bgColor }) => palette(bgColor[0], bgColor[1], 0)};
    box-shadow: none;
    border-radius: ${props => props.radius} !important;
    max-width: ${props => (props.fullWidth ? '100%' : '640px')} !important;
    box-sizing: border-box;
    height: 48px;
    margin: 0 auto;
  }
  .message {
    flex: 1;
    text-align: ${props => props.messageAlign};
  }

  && > ${JuiIconButton} {
    color: ${palette('common', 'white')};
  }

  && > ${JuiButton} {
    color: ${palette('common', 'white')};
  }
`;

export { SnackbarContent };
