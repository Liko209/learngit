import React from 'react';
import styled from 'styled-components';
import MuiIconButton, { IconButtonProps } from '@material-ui/core/IconButton';
import { WithTheme, Icon, Tooltip } from '@material-ui/core';

export type TIconButtonProps = {
  tooltipTitle?: string;
  invisible?: boolean;
  awake?: boolean;
  active?: boolean;
  size?: 'small' | 'medium' | 'large';
} & IconButtonProps &
  Partial<Pick<WithTheme, 'theme'>>;

const MuiIconButtonWrapper = styled(MuiIconButton)`
  &.muiIconButtonWrapper {
    border-radius: 100%;
    &:hover {
      background-color: transparent;
    }
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

const sizes = {
  large: '24px',
  medium: '20px',
  small: '16px',
};

export const IconButton = styled<TIconButtonProps>(CustomIconButton)`
  && {
    width: ${props => props.size ? sizes[props.size] : sizes['medium']};
    height: ${props => props.size ? sizes[props.size] : sizes['medium']};
    ${MuiIconButtonWrapper} {
      width: ${props => props.size ? sizes[props.size] : sizes['medium']};
      height: ${props => props.size ? sizes[props.size] : sizes['medium']};
    }
    ${IconWrapper} {
      color: ${props =>
    props.disabled ? '#BFBFBF' :
      props.active ? props.theme.palette.primary.main :
        props.awake ? '#9e9e9e' :
          props.invisible ? 'transparent' : '#BFBFBF'};
      font-size: ${props => props.size ? sizes[props.size] : sizes['medium']};
      :hover {
        color: ${props => props.theme.palette.primary.main}
      }
    }
  }
`;

export default IconButton;
