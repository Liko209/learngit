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
import styled, { css } from '../../../foundation/styled-components';
import {
  typography,
  spacing,
  palette,
  width,
  rippleEnter,
  height,
  grey,
  primary,
} from '../../../foundation/utils/styles';
import { Omit } from '../../../foundation/utils/typeHelper';

type Variant = 'round' | 'text' | 'contained' | 'outlined' | 'fab';

export type JuiButtonProps = Omit<MuiButtonProps, 'innerRef' | 'variant'> & {
  size?: 'small' | 'large';
  variant?: Variant;
  disabled?: boolean;
  color?: 'primary' | 'secondary';
};

const touchRippleClasses = {
  rippleVisible: 'rippleVisible',
};
const WrappedMuiButton = (props: JuiButtonProps) => {
  const { variant, ...restProps } = props;
  let _variant = variant;
  if (_variant === 'round') {
    _variant = 'fab';
    restProps.disableRipple = true;
    restProps.size = 'small';
  }
  return (
    <MuiButton
      classes={{
        disabled: 'disabled',
        contained: 'containedButtonStyle',
        fab: 'roundButtonStyle',
      }}
      TouchRippleProps={{ classes: touchRippleClasses }}
      variant={_variant}
      {...restProps}
    />
  );
};

const shadow = (n: number) => {
  return css<JuiButtonProps>`
    box-shadow: ${({ theme, variant }) =>
      variant === 'round' ? theme.shadows[n] : 'unset'};
  `;
};

const StyledButton = styled<JuiButtonProps>(WrappedMuiButton)`
  && {
    min-width: ${({ theme }) => width(26)({ theme })};
    padding-left: ${spacing(4)};
    padding-right: ${spacing(4)};
    text-transform: none;
    ${typography('button')};
    &.containedButtonStyle {
      color: white;
      ${shadow(3)}
      &:hover {
        background-color: ${({ theme, color = 'primary' }) =>
          tinycolor(palette(color, 'main')({ theme }))
            .setAlpha(1 - theme.palette.action.hoverOpacity)
            .toRgbString()};
      }
      &:active {
        ${shadow(1)}
      }
    }

    &.roundButtonStyle {
      height: ${({ theme }) => height(7)({ theme })};
      border-radius: ${({ theme }) => spacing(7)({ theme })};
      padding: ${({ theme }) => spacing(0, 4)({ theme })};
      background-color: ${palette('common', 'white')};
      color:${primary('700')};
      width:inherit;
      &:hover {
        background-color: ${grey('50')}
      &:active {
        background-color: ${grey('100')};

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

export const JuiButton: React.StatelessComponent<JuiButtonProps> = (
  props: JuiButtonProps,
) => <StyledButton {...props} />;

JuiButton.defaultProps = {
  size: 'large',
  color: 'primary',
  variant: 'contained',
  disabled: false,
};
