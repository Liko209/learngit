/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-22 15:22:51
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../styled-components';
import MuiIconButton, { IconButtonProps } from '@material-ui/core/IconButton';
import { Icon as MuiIcon, Tooltip as MuiTooltip } from '@material-ui/core';

type TIconButtonProps = {
  tooltipTitle?: string;
  invisible?: boolean;
  awake?: boolean;
  variant?: 'round' | 'plain';
  size?: 'small' | 'medium' | 'large';
} & IconButtonProps;

const sizes = {
  'plain-large': 6,
  'plain-medium': 5,
  'plain-small': 4,
  'round-large': 12,
  'round-medium': 10,
  'round-small': 8,
};

const WrappedMuiIcon = ({ invisible, awake, ...rest }: TIconButtonProps) => (
  <MuiIcon {...rest} />
);
const StyledIcon = styled<TIconButtonProps>(WrappedMuiIcon)`
  && {
    color: ${({ disabled, awake, invisible, theme }) => disabled ? theme.palette.accent.ash :
    awake ? theme.palette.grey[500] :
      invisible ? 'transparent' : theme.palette.accent.ash};
    font-size: ${({ variant, size, theme }) => (sizes[`${variant}-${size}`] * theme.spacing.unit /
    (variant === 'round' ? 2 : 1) + 'px')};
  }
`;

const WrappedMuiIconButton = ({ invisible, awake, ...rest }: TIconButtonProps) => (
  <MuiIconButton {...rest} />
);
const StyledIconButton = styled<TIconButtonProps>(WrappedMuiIconButton)`
  && {
    width: ${({ variant, size, theme }) => (
    sizes[`${variant}-${size}`] * theme.spacing.unit + 'px'
  )};
    height: ${({ variant, size, theme }) => (
    sizes[`${variant}-${size}`] * theme.spacing.unit + 'px'
  )};
    &:hover {
      background-color: ${({ theme, variant }) => variant === 'plain' ?
    'transparent' : theme.palette.action.hover};
    }
    &:active {
      ${StyledIcon} {
        color: ${({ theme, color }) => color ? theme.palette[color].main : 'inherit'}
      }
    }
  }
`;

const IconButton: React.SFC<TIconButtonProps> = (
  props: TIconButtonProps,
) => {
  const { className, children, tooltipTitle, innerRef, ...rest } = props;
  const { size, variant, awake, disabled, invisible } = rest;
  const main = (
    <StyledIconButton className={className} disableRipple={rest.variant === 'plain'} {...rest}>
      <StyledIcon
        size={size}
        variant={variant}
        awake={awake}
        disabled={disabled}
        invisible={invisible}
      >{children}
      </StyledIcon>
    </StyledIconButton>
  );
  return tooltipTitle ? (<MuiTooltip title={tooltipTitle}>{main}</MuiTooltip>) : main;
};

IconButton.defaultProps = {
  variant: 'round',
  color: 'primary',
  size: 'medium',
};

export { IconButton, IconButtonProps };
export default IconButton;
