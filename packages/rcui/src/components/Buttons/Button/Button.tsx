import * as React from 'react';
import MuiButton, {
  ButtonProps as MuiButtonProps,
} from '@material-ui/core/Button';
import { fade } from '@material-ui/core/styles/colorManipulator';
import styled from '../../../foundation/styled-components';
import { Omit } from '../../../foundation/utils/typeHelper';
import {
  spacing,
  palette,
  typography,
  shadows,
} from '../../../foundation/shared/theme';
import dataColors from '../../../foundation/shared/colors.json';
import { RuiCircularProgress } from '../../Progress';
import { rippleEnter } from '../../../foundation/shared/styles';

type RuiButtonVariant = MuiButtonProps['variant'] | 'round';

type RuiButtonColor = MuiButtonProps['color'] | 'error';

type RuiButtonSize = 'medium' | 'large' | 'small';

type RuiButtonProps = {
  size?: RuiButtonSize;
  variant?: RuiButtonVariant;
  disabled?: boolean;
  color?: RuiButtonColor;
  loading?: boolean;
} & Omit<MuiButtonProps, 'innerRef' | 'color' | 'variant'>;

const ColorMap = {
  primary: palette('primary', 'main'),
  secondary: palette('secondary', 'main'),
  error: palette('error', 'main'),
};

const touchRippleClasses = {
  rippleVisible: 'rippleVisible',
};

const sizes = {
  large: '36px',
  medium: '32px',
};

const minWith = {
  large: '64px',
  medium: '40px',
};

const borderColors = {
  primary: palette('primary', 'main'),
  error: palette('error', 'main'),
  secondary: palette('secondary', 'main'),
};

const roundButtonPadding = {
  large: '17px',
  medium: '13px',
};

const RuiButton = (props: RuiButtonProps) => {
  const {
    variant,
    color,
    children,
    loading,
    fullWidth,
    size,
    ...restProps
  } = props;
  const _color = color;
  let _size = size;
  if (fullWidth) {
    _size = 'medium';
  }
  let _variant = variant;
  const classes = {
    disabled: 'disabled',
    contained: 'containedButtonStyle',
    text: 'textButtonStyle',
    outlined: 'outlineButtonStyle',
    root: 'root',
    label: 'label',
    fab: 'roundButtonStyle',
  };
  if (variant === 'round') {
    _variant = 'fab';
    restProps.disableRipple = true;
    restProps.disabled = false;
  }
  const loadingCom = loading ? (
    <RuiCircularProgress size={20} />
  ) : (
      children
    );
  return (
    <StyledButton
      classes={classes}
      TouchRippleProps={{ classes: touchRippleClasses }}
      variant={_variant}
      color={_color}
      size={_size}
      fullWidth={fullWidth}
      {...restProps}
    >
      {loadingCom}
    </StyledButton>
  );
};

const StyledButton = styled(MuiButton) <RuiButtonProps>`
  && {
    padding-right: ${spacing('s')};
    padding-left: ${spacing('s')};
    ${typography('button')};
    color: ${palette('primary', 'main')};
    height: ${({ size = 'large' }) => sizes[size]};
    & > span[class*="label"] {
      min-width: ${({ size = 'large' }) => minWith[size]};
    }
    &.root {
      text-transform: none;
      padding-top: 0;
      padding-bottom: 0;
    }
    &.containedButtonStyle {
      color: white;
      background-color: ${({ color = 'primary' }) => ColorMap[color]};
      box-shadow: unset;
      &:active {
      }
      &:hover {
        opacity: ${({ theme }) => 1 - theme.palette.action.hoverOpacity};
      }
      &:disabled {
        color: white;
        box-shadow: none;
        background-color: ${palette('action', 'disabledBackground')};
      }
    }
    &.textButtonStyle {
      color: ${({ color = 'primary' }) => ColorMap[color]};
      &.disabled {
        color: ${dataColors['ash']};
      }
      &:hover {
        background-color: ${({ theme, color }) =>
    fade(
      theme.palette[`${color}`].main,
      theme.palette.action.hoverOpacity,
    )};
      }
    }
    &.outlineButtonStyle {
      border-color: ${({ color = 'primary' }) => borderColors[color]};
      background-color: ${palette('common', 'white')};
      color: ${({ color = 'primary' }) => ColorMap[color]};
      &.disabled {
        color: ${palette('action', 'disabled')};
        background-color: ${palette('common', 'white')};
        border-color: ${palette('action', 'disabledBackground')};
      }
      &:hover {
        background-color: ${({ theme, color }) =>
    fade(
      theme.palette[`${color}`].main,
      theme.palette.action.hoverOpacity,
    )};
      }
    }
    &.roundButtonStyle {
      height: ${({ size = 'large' }) => sizes[size]};
      border-radius: 28px;
      padding: 0 ${({ size = 'large' }) => roundButtonPadding[size]};
      background-color: ${palette('common', 'white')};
      color: ${({ theme }) => theme.palette.primary.main};
      ${typography('caption1')};
      min-height: unset;
      width: inherit;
      box-shadow: ${shadows(3)};
      &:hover {
        background-color: ${({ theme }) => theme.palette.grey[50]};
        &:active {
          background-color: ${({ theme }) => theme.palette.grey[100]};
        }
      }
      .rippleVisible {
        opacity: ${({ theme }) => theme.palette.action.hoverOpacity * 2};
        transform: scale(1);
        animation-name: ${({ theme }) => rippleEnter(theme)};
      }
    }
  }
` as React.ComponentType<RuiButtonProps>;

RuiButton.defaultProps = {
  size: 'large',
  color: 'primary',
  variant: 'contained',
  disabled: false,
};
export { RuiButton, RuiButtonProps, RuiButtonColor };
