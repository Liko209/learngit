/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-22 15:24:02
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import tinycolor from 'tinycolor2';
import MuiButton, {
  ButtonProps as MuiButtonProps,
} from '@material-ui/core/Button';
import styled, {
  keyframes,
  Dependencies,
} from '../../../foundation/styled-components';
import {
  typography,
  spacing,
  palette,
  width,
} from '../../../foundation/utils/styles';
import { Omit } from '../../../foundation/utils/typeHelper';
import { Theme } from '../../../foundation/theme/theme';

export type JuiButtonProps = Omit<MuiButtonProps, 'innerRef'> & {
  size?: 'small' | 'large';
  variant?: 'text' | 'contained';
  disabled?: boolean;
  color?: 'primary' | 'secondary';
};

const rippleEnter = (theme: Theme) => keyframes`
  from {
    transform: scale(0);
    opacity: 0.1;
  }
  to {
    transform: scale(1);
    opacity: ${theme.palette.action.hoverOpacity * 2};
  }
`;

const touchRippleClasses = {
  rippleVisible: 'rippleVisible',
};
const WrappedMuiButton = (props: JuiButtonProps) => (
  <MuiButton
    classes={{ disabled: 'disabled', contained: 'containedButtonStyle' }}
    TouchRippleProps={{ classes: touchRippleClasses }}
    {...props}
  />
);
const StyledButton = styled<JuiButtonProps>(WrappedMuiButton)`
  && {
    min-width: ${({ theme }) => width(26)({ theme })};
    padding-left: ${spacing(4)};
    padding-right: ${spacing(4)};
    ${typography('button')} &.containedButtonStyle {
      box-shadow: unset;
      color: white;
      &:hover {
        background-color: ${({ theme, color = 'primary' }) =>
          tinycolor(palette(color, 'main')({ theme }))
            .setAlpha(1 - theme.palette.action.hoverOpacity)
            .toRgbString()};
      }
      &:active {
        box-shadow: unset;
      }
    }

    &.textButtonStyle {
      &.disabled {
        color: ${palette('accent', 'ash')};
      }
    }

    .rippleVisible {
      opacity: ${({ theme }) => theme.palette.action.hoverOpacity * 2};
      transform: scale(1);
      animation-name: ${({ theme }) => rippleEnter(theme)};
    }
  }
`;

export const JuiButton: React.StatelessComponent<JuiButtonProps> &
  Dependencies = (props: JuiButtonProps) => <StyledButton {...props} />;

JuiButton.defaultProps = {
  size: 'large',
  color: 'primary',
  variant: 'contained',
  disabled: false,
};

JuiButton.dependencies = [MuiButton];
