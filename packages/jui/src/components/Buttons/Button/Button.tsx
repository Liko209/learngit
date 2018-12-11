/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-22 15:24:02
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import MuiButton, {
  ButtonProps as MuiButtonProps,
} from '@material-ui/core/Button';
import { Palette } from '../../../foundation/theme/theme';
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

type JuiButtonColor = 'primary' | 'secondary' | 'negative';

type JuiButtonProps = Omit<MuiButtonProps, 'innerRef' | 'variant' | 'color'> & {
  size?: 'small' | 'large';
  variant?: Variant;
  disabled?: boolean;
  color?: JuiButtonColor;
};

const ColorMap: {
  [x: string]: [keyof Palette, string];
} = {
  primary: ['primary', 'main'],
  secondary: ['secondary', 'main'],
  negative: ['semantic', 'negative'],
};

const touchRippleClasses = {
  rippleVisible: 'rippleVisible',
};
const WrappedMuiButton = (props: JuiButtonProps) => {
  const { variant, color, ...restProps } = props;
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
        text: 'textButtonStyle',
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
    ${typography('button')};
    color: ${palette('primary', 'main')};
    &.containedButtonStyle {
      color: ${palette('common', 'white')};
      ${shadow(3)}
      background-color: ${({ color = 'primary' }) =>
        palette(ColorMap[color][0], ColorMap[color][1])}
      &:hover {
        opacity: ${({ theme }) => 1 - theme.palette.action.hoverOpacity}
      }
      &.disabled {
        background-color: ${palette('accent', 'ash')};
        color: ${palette('common', 'while')};
      }
      &:active {
        ${shadow(1)}
      }
    }

    &.textButtonStyle {
      &.disabled {
        color: ${palette('accent', 'ash')};
      }
      &:hover {
        background-color: ${palette('primary', 'main', 1)};
      }
    }

    &.roundButtonStyle {
      height: ${({ theme }) => height(7)({ theme })};
      border-radius: ${({ theme }) => spacing(7)({ theme })};
      padding: ${({ theme }) => spacing(0, 4)({ theme })};
      background-color: ${palette('common', 'white')};
      color:${primary('700')};
      ${typography('caption')};
      min-height:unset;
      width:inherit;
      &:hover {
        background-color: ${grey('50')};
      &:active {
        background-color: ${grey('100')};
      }
    }

    .rippleVisible {
      opacity: ${({ theme }) => theme.palette.action.hoverOpacity * 2};
      transform: scale(1);
      animation-name: ${({ theme }) => rippleEnter(theme)};
    }
  }
`;

const JuiButtonComponent: React.StatelessComponent<JuiButtonProps> = (
  props: JuiButtonProps,
) => <StyledButton {...props} />;

JuiButtonComponent.defaultProps = {
  size: 'large',
  color: 'primary',
  variant: 'contained',
  disabled: false,
};

const JuiButton = styled(JuiButtonComponent)``;

export { JuiButton, JuiButtonProps, JuiButtonColor };
