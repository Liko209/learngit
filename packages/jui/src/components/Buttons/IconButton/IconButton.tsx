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
import MuiTooltip from '@material-ui/core/Tooltip';
import tinycolor from 'tinycolor2';
import styled, {
  keyframes,
  Dependencies,
} from '../../../foundation/styled-components';
import { JuiArrowTip } from '../../Tooltip/ArrowTip';
import { palette, grey, width } from '../../../foundation/utils/styles';
import { Theme } from '../../../foundation/theme/theme';

type JuiIconButtonProps = {
  tooltipTitle?: string;
  invisible?: boolean;
  awake?: boolean;
  variant?: 'round' | 'plain';
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary';
  innerRef?: RefObject<HTMLElement>;
} & MuiIconButtonProps &
  MuiIconProps;

const iconSizes = {
  large: 6,
  medium: 5,
  small: 4,
};

const WrappedMuiIcon = ({ invisible, awake, ...rest }: JuiIconButtonProps) => (
  <MuiIcon {...rest} />
);
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
const WrappedMuiIconButton = ({
  invisible,
  awake,
  ...rest
}: JuiIconButtonProps) => (
  <MuiIconButton
    {...rest}
    classes={{ disabled: 'disabled' }}
    TouchRippleProps={{ classes: touchRippleClasses }}
  />
);
const StyledIconButton = styled<JuiIconButtonProps>(WrappedMuiIconButton)`
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
    color: ${({ awake }) => (awake ? grey('500') : palette('accent', 'ash'))};
    opacity: ${({ invisible }) => (invisible ? 0 : 1)};
    ${StyledIcon} {
      font-size: ${({ size = 'medium', theme }) =>
        width(iconSizes[size])({ theme })};
    }
    &:hover {
      background-color: ${({ theme, variant }) =>
        variant === 'plain'
          ? 'transparent'
          : tinycolor(grey('500')({ theme }))
              .setAlpha(theme.palette.action.hoverOpacity)
              .toRgbString()};
      ${StyledIcon} {
        color: ${({ theme }) =>
          tinycolor(grey('500')({ theme }))
            .setAlpha(1 - theme.palette.action.hoverOpacity)
            .toRgbString()};
      }
    }
    &:active {
      ${StyledIcon} {
        color: ${({ theme, color = 'primary' }) =>
          palette(color, 'main')({ theme })};
      }
    }

    &.disabled {
      ${StyledIcon} {
        color: ${({ theme }) =>
          palette('action', 'disabledBackground')({ theme })};
      }
    }

    .rippleVisible {
      color: ${({ theme, color = 'primary' }) =>
        palette(color, 'main')({ theme })};
      opacity: ${({ theme }) => theme.palette.action.hoverOpacity * 2};
      transform: scale(1);
      animation-name: ${({ theme }) => rippleEnter(theme)};
    }
  }
`;

// Tooltip does not work on disabled IconButton without this: https://github.com/mui-org/material-ui/issues/8416
const WrapperForTooltip = styled<JuiIconButtonProps, 'div'>('div')`
  display: inline-block;
  width: ${({ variant, size = 'medium', theme }) =>
    width(variant === 'round' ? iconSizes[size] * 2 : iconSizes[size])({
      theme,
    })};
  height: ${({ variant, size = 'medium', theme }) =>
    width(variant === 'round' ? iconSizes[size] * 2 : iconSizes[size])({
      theme,
    })};
  font-size: 0;
`;

export const JuiIconButton: React.SFC<JuiIconButtonProps> & Dependencies = (
  props: JuiIconButtonProps,
) => {
  const { className, children, tooltipTitle, innerRef, ...rest } = props;
  const { size, variant, awake, disabled, invisible } = rest;
  return (
    <JuiArrowTip title={tooltipTitle}>
      <WrapperForTooltip
        className={className}
        innerRef={innerRef}
        variant={variant}
        size={size}
      >
        <StyledIconButton disableRipple={rest.variant === 'plain'} {...rest}>
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
      </WrapperForTooltip>
    </JuiArrowTip>
  );
};

JuiIconButton.defaultProps = {
  variant: 'round',
  color: 'primary',
  size: 'medium',
  invisible: false,
  tooltipTitle: '',
};

JuiIconButton.dependencies = [MuiIconButton, MuiIcon, MuiTooltip];

export { JuiIconButtonProps };
