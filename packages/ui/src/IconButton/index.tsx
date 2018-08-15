import React from 'react';
import styled from 'styled-components';
import MuiIconButton, { IconButtonProps } from '@material-ui/core/IconButton';
import { WithTheme, Icon, Tooltip } from '@material-ui/core';

export type TIconButtonProps = {
  tooltipTitle?: string;
  invisible?: boolean;
  awake?: boolean;
  active?: boolean;
  variant?: 'round' | 'plain';
  size?: 'small' | 'medium' | 'large';
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
  const { children, tooltipTitle, innerRef, awake, active, invisible, ...rest } = props;
  const classes = {
    root: 'muiIconButtonWrapper',
  };
  const main = (
    <MuiIconButtonWrapper disableRipple={true} classes={classes} {...rest}>
      <IconWrapper>{children}</IconWrapper>
    </MuiIconButtonWrapper>
  );
  return tooltipTitle ? (<Tooltip title={tooltipTitle}>{main}</Tooltip>) : main;
};

CustomIconButton.defaultProps = {
  variant: 'round',
};

const sizes = {
  'plain-large': '24px',
  'plain-medium': '20px',
  'plain-small': '16px',
  'round-large': '48px',
  'round-medium': '40px',
  'round-small': '32px',
};

export const IconButton = styled<TIconButtonProps>(CustomIconButton)`
  && {
    width: ${props => sizes[`${props.variant}-${props.size}`]};
    height: ${props => sizes[`${props.variant}-${props.size}`]};
    ${MuiIconButtonWrapper} {
      width: ${props => sizes[`${props.variant}-${props.size}`]};
      height: ${props => sizes[`${props.variant}-${props.size}`]};
      &:hover {
        background-color: ${props => props.variant === 'plain' ? 'transparent' : ''};
      }
    }
    ${IconWrapper} {
      color: ${props =>
    props.disabled ? '#BFBFBF' :
      props.active ? props.theme.palette.primary.main :
        props.awake ? '#9e9e9e' :
          props.invisible ? 'transparent' : '#BFBFBF'};
      font-size: ${props => sizes[`${props.variant}-${props.size}`]};
      :hover {
        color: ${props => props.variant === 'plain' ? props.theme.palette.primary.main : ''}
      }
    }
  }
`;

export default IconButton;
