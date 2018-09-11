/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-22 15:24:02
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import tinycolor from 'tinycolor2';
import styled, { keyframes, IDependencies } from '../../styled-components';
import MuiButton, { ButtonProps as MuiButtonProps } from '@material-ui/core/Button';
import { typography, spacing, palette, width } from '../../utils/styles';
import { Theme } from '../../theme';

type JuiButtonProps = MuiButtonProps & {
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
    ${typography('button')}

    &.containedButtonStyle {
      box-shadow: unset;
      color: white;
      &:hover {
        background-color: ${({ theme, color = 'primary' }) => tinycolor(palette(color, 'main')({ theme })).setAlpha(1 - theme.palette.action.hoverOpacity).toRgbString()};
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

type IButton = React.StatelessComponent<JuiButtonProps> & IDependencies;
const JuiButton: IButton = ({ innerRef, ...rest }: JuiButtonProps) => (<StyledButton {...rest} />);

JuiButton.defaultProps = {
  size: 'large',
  color: 'primary',
  variant: 'contained',
  disabled: false,
};

JuiButton.dependencies = [MuiButton];

export { JuiButton, JuiButtonProps };
export default JuiButton;
