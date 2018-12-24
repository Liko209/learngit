/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-11-22 15:22:09
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { StyledTextButton, StyledIconButton } from './style';
import { Palette } from '../../foundation/theme/theme';
import MuiSnackbarContent, { SnackbarContentProps as MuiSnackbarContentProps } from '@material-ui/core/SnackbarContent';
import { JuiSnackbarAction } from './SnackbarAction';
import styled from '../../foundation/styled-components';

import {
  spacing,
  palette,
  typography,
  width,
  height,
} from '../../foundation/utils/styles';

type JuiSnackbarContentBaseProps = {
  messageAlign: MessageAlignment;
  fullWidth: boolean;
} & MuiSnackbarContentProps;

type SnackbarContentProps = JuiSnackbarContentBaseProps & {
  bgColor: SnackbarContentColor;
};

type JuiSnackbarContentProps = JuiSnackbarContentBaseProps & {
  type: JuiSnackbarsType;
};

const WrapperContent = ({
  messageAlign,
  bgColor,
  fullWidth,
  ...rest
}: SnackbarContentProps) => <MuiSnackbarContent {...rest} />;

type JuiSnackbarsType = 'warn' | 'success' | 'error' | 'info';
type SnackbarContentColor = [keyof Palette, string];
type MessageAlignment = 'left' | 'center';
type ColorType = {
  color: SnackbarContentColor;
};
type ColorMap = {
  [key: string]: ColorType;
};

const COLOR_MAP: ColorMap = {
  warn: {
    color: ['semantic', 'critical'],
  },
  success: {
    color: ['semantic', 'positive'],
  },
  error: {
    color: ['semantic', 'negative'],
  },
  info: {
    color: ['grey', '700'],
  },
};

function getColor(type: JuiSnackbarsType, map: ColorMap): ColorType {
  return map[type];
}

const SnackbarContent = styled<SnackbarContentProps>(WrapperContent)`

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

  ${JuiSnackbarAction} + ${StyledTextButton} {
    margin-left: ${spacing(3)};
  }

  ${JuiSnackbarAction} + ${StyledIconButton} {
    margin-left: ${spacing(4)};
  }
`;
class JuiSnackbarContent extends React.PureComponent<JuiSnackbarContentProps> {
  static defaultProps = {
    radius: 0,
    messageAlign: 'left',
    fullWidth: false,
  };

  render() {
    const { type, ...rest } = this.props;
    const result = getColor(type, COLOR_MAP);
    const color = result.color;
    return (
      <SnackbarContent
        classes={{
          message: 'message',
          action: 'action',
        }}
        bgColor={color}
        {...rest}
      />
    );
  }
}

export {
  JuiSnackbarContent,
  JuiSnackbarContentProps,
  MessageAlignment,
  SnackbarContentColor,
  JuiSnackbarsType,
};
