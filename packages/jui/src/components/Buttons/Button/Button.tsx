/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-22 15:24:02
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import MuiButton, {
  ButtonProps as MuiButtonProps,
} from '@material-ui/core/Button';
import { RuiCircularProgress } from 'rcui/components/Progress';
import { Palette, Theme } from '../../../foundation/theme/theme';
import styled from '../../../foundation/styled-components';
import {
  typography,
  spacing,
  palette,
  rippleEnter,
  width,
  height,
  grey,
  primary,
} from '../../../foundation/utils/styles';
import { Omit } from '../../../foundation/utils/typeHelper';

type Variant = 'text' | 'contained' | 'outlined';

type JuiButtonColor = 'primary' | 'secondary' | 'negative' | 'action';

type JuiButtonProps = Omit<MuiButtonProps, 'innerRef' | 'variant' | 'color'> & {
  size?: 'large' | 'medium';
  variant?: Variant;
  disabled?: boolean;
  color?: JuiButtonColor;
  loading?: boolean;
  component?: React.ElementType;
};

const ColorMap: {
  [x: string]: [keyof Palette, string];
} = {
  primary: ['primary', 'main'],
  secondary: ['secondary', 'main'],
  negative: ['semantic', 'negative'],
  action: ['common', 'white'],
};

const touchRippleClasses = {
  rippleVisible: 'rippleVisible',
};

const WrappedMuiButton = (props: JuiButtonProps) => {
  const { variant, color, children, loading, ...restProps } = props;
  return (
    <MuiButton
      classes={{
        disabled: 'disabled',
        contained: 'containedButtonStyle',
        text: 'textButtonStyle',
        outlined: 'outlineButtonStyle',
      }}
      TouchRippleProps={{ classes: touchRippleClasses }}
      variant={variant}
      {...restProps}
    >
      {loading ? <RuiCircularProgress size={16} color="inherit" /> : children}
    </MuiButton>
  );
};

const ButtonColor = ({
  theme,
  color = 'primary',
}: {
  theme: Theme;
  color: JuiButtonColor;
}) =>
  theme.palette.getContrastText(
    palette(ColorMap[color][0], ColorMap[color][1])({ theme }),
  );

const StyledButton = styled<JuiButtonProps>(WrappedMuiButton)`
  && {
    display: flex;
    text-transform: none;
    ${typography('button')};
    color: ${palette('primary', 'main')};
    text-align: center;
    box-shadow: unset;
    padding: ${spacing(2, 3)};
    min-width: ${width(22)};
    &.MuiButton-sizeLarge {
      padding: ${spacing(2.5, 4)};
      min-width: ${width(24)};
    }
    &.containedButtonStyle {
      color: ${ButtonColor};
      background-color: ${({ color = 'primary' }) =>
        palette(ColorMap[color][0], ColorMap[color][1])};
      &:hover {
        opacity: ${({ theme }) => 1 - theme.palette.action.hoverOpacity};
      }
      &.disabled {
        background-color: ${({ theme, loading }) =>
          loading ? '' : palette('accent', 'ash')({ theme })};
        color: ${ButtonColor};
      }
    }

    &.textButtonStyle {
      color: ${({ color = 'primary' }) =>
        palette(ColorMap[color][0], ColorMap[color][1])};
      &.disabled {
        color: ${({ theme, loading }) =>
          loading ? '' : palette('accent', 'ash')({ theme })};
      }
      &:hover {
        background-color: ${({ color = 'primary' }) =>
          palette(ColorMap[color][0], ColorMap[color][1], 1)};
      }
    }

    &.outlineButtonStyle {
      border-color: ${palette('primary', 'main')};
    }

    &.roundButtonStyle {
      height: ${({ theme }) => height(7)({ theme })};
      border-radius: ${({ theme }) => spacing(7)({ theme })};
      padding: ${({ theme }) => spacing(0, 4)({ theme })};
      background-color: ${({ theme }) =>
        theme.palette.getContrastText(primary('700')({ theme }))};
      color: ${primary('700')};
      ${typography('caption1')};
      min-height: unset;
      width: inherit;
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

const JuiButton = styled(React.memo(JuiButtonComponent))``;

export { JuiButton, JuiButtonProps, JuiButtonColor, ColorMap };
