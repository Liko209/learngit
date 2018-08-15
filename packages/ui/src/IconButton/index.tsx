import React from 'react';
import styled from 'styled-components';
import MuiIconButton, { IconButtonProps } from '@material-ui/core/IconButton';
import { WithTheme, Icon, Tooltip } from '@material-ui/core';

export type TIconButtonProps = {
  tooltipTitle?: string;
  invisible?: boolean;
  awake?: boolean;
  variant: 'round' | 'plain';
  size: 'small' | 'medium' | 'large';
} & IconButtonProps &
  Partial<Pick<WithTheme, 'theme'>>;

const MuiIconButtonWrapper = styled(MuiIconButton)`
  &.muiIconButtonWrapper {
    border-radius: 100%;
  }
`;

const IconWrapper = styled(Icon)``;

export const CustomIconButton: React.SFC<TIconButtonProps> = (
  props: TIconButtonProps,
) => {
  const { children, tooltipTitle, innerRef, awake, invisible, variant, ...rest } = props;
  const classes = {
    root: 'muiIconButtonWrapper',
  };
  const main = (
    <MuiIconButtonWrapper disableRipple={variant === 'plain'} classes={classes} {...rest}>
      <IconWrapper>{children}</IconWrapper>
    </MuiIconButtonWrapper>
  );
  return tooltipTitle ? (<Tooltip title={tooltipTitle}>{main}</Tooltip>) : main;
};

const sizes = {
  'plain-large': 24,
  'plain-medium': 20,
  'plain-small': 16,
  'round-large': 48,
  'round-medium': 40,
  'round-small': 32,
};

export const IconButton = styled<TIconButtonProps>(CustomIconButton)`
  && {
    width: ${(props: TIconButtonProps) => {
      console.log(props);
    }};
    width: ${props => (sizes[`${props.variant}-${props.size}`] + 'px')};
    height: ${props => (sizes[`${props.variant}-${props.size}`] + 'px')};
    &:hover {
      background-color: ${props => props.variant === 'plain' ?
        'transparent' :
        props.theme.palette.action.hover
      };
    }
    ${MuiIconButtonWrapper} {
      width: ${props => (sizes[`${props.variant}-${props.size}`] + 'px')};
      height: ${props => (sizes[`${props.variant}-${props.size}`] + 'px')};
      &:hover {
        background-color: ${props => props.variant === 'plain' ? 'transparent' : ''};
      }
    }
    &:active {
      ${IconWrapper} {
        color: ${props => props.theme.palette[props.color].main}
      }
    }
    ${IconWrapper} {
      color: ${props =>
    props.disabled ? '#BFBFBF' :
      props.awake ? '#9e9e9e' :
        props.invisible ? 'transparent' : '#BFBFBF'};
      font-size: ${props => (sizes[`${props.variant}-${props.size}`] /
        (props.variant === 'round' ? 2 : 1) + 'px')};
    }
  }
`;

IconButton.defaultProps = {
  variant: 'round',
  color: 'primary',
  size: 'medium',
};

export default IconButton;
