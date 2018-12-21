/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-22 15:22:51
 * Copyright © RingCentral. All rights reserved.
 */
import React, { RefObject } from 'react';
import MuiIconButton, {
  IconButtonProps as MuiIconButtonProps,
} from '@material-ui/core/IconButton';
import MuiIcon, { IconProps as MuiIconProps } from '@material-ui/core/Icon';
import tinycolor from 'tinycolor2';
import styled, { keyframes } from '../../../foundation/styled-components';
import { JuiArrowTip } from '../../Tooltip/ArrowTip';
import { palette, grey, width } from '../../../foundation/utils/styles';
import { Theme, Palette } from '../../../foundation/theme/theme';
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

type IconButtonVariant = 'round' | 'plain';
type IconButtonSize = 'small' | 'medium' | 'large';

type JuiIconButtonProps = {
  tooltipTitle?: string;
  invisible?: boolean;
  awake?: boolean;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  color?: string;
  disableToolTip?: boolean;
  alwaysEnableTooltip?: boolean;
  ariaLabel?: string;
  innerRef?: RefObject<HTMLElement>;
} & Omit<MuiIconButtonProps, 'color'> &
  Omit<MuiIconProps, 'color'>;

const iconSizes = {
  large: 6,
  medium: 5,
  small: 4,
};

const WrappedMuiIcon = ({
  invisible,
  awake,
  color,
  ...rest
}: JuiIconButtonProps) => <MuiIcon {...rest} />;
const StyledIcon = styled<JuiIconButtonProps>(WrappedMuiIcon)``;
const rippleEnter = (theme: Theme) => keyframes`
  from {
    transform: scale(0);
    opacity: 0.1;
  }
  to {
    transform: scale(1);
    opacity: ${palette('action', 'hoverOpacity')({ theme }) * 2};
  }
`;
const touchRippleClasses = {
  rippleVisible: 'rippleVisible',
};
type StyledIconButtonProps = JuiIconButtonProps & {
  colorName: string;
  colorScope: keyof Palette;
};
const WrappedMuiIconButton = ({
  invisible,
  awake,
  color,
  colorName,
  colorScope,
  alwaysEnableTooltip,
  ...rest
}: StyledIconButtonProps) => (
  <MuiIconButton
    {...rest}
    classes={{ disabled: 'disabled' }}
    TouchRippleProps={{ classes: touchRippleClasses }}
  />
);

const StyledIconButton = styled<StyledIconButtonProps>(WrappedMuiIconButton)`
  && {
    padding: 0;
    width: ${({ variant, size = 'medium', theme }) =>
      width(variant === 'round' ? iconSizes[size] * 2 : iconSizes[size])({
        theme,
      })};
    height: ${({ variant, size = 'medium', theme }) =>
      width(variant === 'round' ? iconSizes[size] * 2 : iconSizes[size])({
        theme,
      })};
    /* color: ${({ awake }) =>
      awake ? grey('500') : palette('accent', 'ash')}; */
    color: ${({ theme, colorScope, colorName }) =>
      palette(colorScope, colorName)({ theme })};
    opacity: ${({ invisible }) => (invisible ? 0 : 1)};
    padding: 0;
    ${StyledIcon} {
      &, svg {
        font-size: ${({ size = 'medium', theme }) =>
          width(iconSizes[size])({ theme })};
      }
    }
    &:hover {
      background-color: ${({ theme, variant, colorScope, colorName }) =>
        variant === 'plain'
          ? 'transparent'
          : tinycolor(palette(colorScope, colorName)({ theme }))
              .setAlpha(theme.palette.action.hoverOpacity)
              .toRgbString()};
      ${StyledIcon} {
        color: ${({ theme, colorScope, colorName }) =>
          tinycolor(palette(colorScope, colorName)({ theme }))
            .setAlpha(1 - theme.palette.action.hoverOpacity)
            .toRgbString()};
      }
    }
    &:active {
      ${StyledIcon} {
        color: ${({ theme, colorScope, colorName }) =>
          palette(colorScope, colorName)({ theme })};
      }
    }

    &&.disabled {
      pointer-events: ${({ alwaysEnableTooltip }) => alwaysEnableTooltip ? 'auto' : 'none'};
      ${StyledIcon} {
        color: ${({ theme }) =>
          palette('action', 'disabledBackground')({ theme })};
      }
    }

    .rippleVisible {
      color: ${({ theme, colorScope, colorName }) =>
        palette(colorScope, colorName)({ theme })};
      opacity: ${({ theme }) => theme.palette.action.hoverOpacity * 2};
      transform: scale(1);
      animation-name: ${({ theme }) => rippleEnter(theme)};
    }
  }
`;

export const JuiIconButtonComponent: React.SFC<JuiIconButtonProps> = (
  props: JuiIconButtonProps,
) => {
  const {
    className,
    children,
    tooltipTitle,
    color,
    disableToolTip = false,
    alwaysEnableTooltip = false,
    ariaLabel,
    ...rest
  } = props;
  const { size, variant, awake, disabled, invisible } = rest;
  let colorScope: keyof Palette = 'primary';
  let colorName: string = 'main';
  if (color && color.indexOf('.') >= 0) {
    const array = color.split('.');
    if (array.length > 1) {
      colorScope = array[0] as keyof Palette;
      colorName = array[1];
    } else {
      colorScope = array[0] as keyof Palette;
      colorName = 'main';
    }
  }
  const renderToolTip = () => {
    return (
      <StyledIconButton
        disableRipple={rest.variant === 'plain'}
        colorScope={colorScope}
        colorName={colorName}
        aria-label={ariaLabel}
        className={className}
        alwaysEnableTooltip={alwaysEnableTooltip}
        {...rest}
      >
        <StyledIcon
          size={size}
          variant={variant}
          awake={awake}
          disabled={disabled}
          invisible={invisible}
        >
          {children}
        </StyledIcon>
      </StyledIconButton>
    );
  };
  if (!disableToolTip) {
    return <JuiArrowTip title={tooltipTitle}>{renderToolTip()}</JuiArrowTip>;
  }
  return renderToolTip();
};

JuiIconButtonComponent.defaultProps = {
  variant: 'round',
  color: 'grey.500',
  size: 'medium',
  invisible: false,
  tooltipTitle: '',
};

const JuiIconButton = styled(JuiIconButtonComponent)``;
export { JuiIconButton, JuiIconButtonProps, IconButtonVariant, IconButtonSize };
