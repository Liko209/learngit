import React from 'react';
import styled from 'styled-components';
import MuiIconButton, { IconButtonProps } from '@material-ui/core/IconButton';
import { WithTheme, Icon as MuiIcon, Tooltip as MuiTooltip } from '@material-ui/core';

type TIconButtonProps = {
  tooltipTitle?: string;
  invisible?: boolean;
  awake?: boolean;
  variant?: 'round' | 'plain';
  size?: 'small' | 'medium' | 'large';
} & IconButtonProps &
  Partial<Pick<WithTheme, 'theme'>>;

const sizes = {
  'plain-large': 24,
  'plain-medium': 20,
  'plain-small': 16,
  'round-large': 48,
  'round-medium': 40,
  'round-small': 32,
};

const getMainColor = (props: TIconButtonProps) =>
  props.color &&
    props.theme &&
    props.theme.palette &&
    props.theme.palette[props.color] &&
    props.theme.palette[props.color].main ?
    props.theme.palette[props.color].main : '';

const getHoverColor = (props: TIconButtonProps) =>
  props.theme && props.theme.palette && props.theme.palette.action ?
    props.theme.palette.action.hover : '';

const MuiIconFiltered = ({ invisible, awake, ...rest }: TIconButtonProps) => (
  <MuiIcon {...rest} />
);
const StyledIcon = styled(MuiIconFiltered)`
  && {
    color: ${(props: TIconButtonProps) => props.disabled ? '#BFBFBF' :
    props.awake ? '#9e9e9e' :
      props.invisible ? 'transparent' : '#BFBFBF'};
    font-size: ${(props: TIconButtonProps) => (sizes[`${props.variant}-${props.size}`] /
    (props.variant === 'round' ? 2 : 1) + 'px')};
  }
`;

const MuiIconButtonFiltered = ({ invisible, awake, ...rest }: TIconButtonProps) => (
  <MuiIconButton {...rest} />
);
const StyledIconButton = styled<TIconButtonProps>(MuiIconButtonFiltered)`
  && {
    width: ${(props: TIconButtonProps) => (sizes[`${props.variant}-${props.size}`] + 'px')};
    height: ${(props: TIconButtonProps) => (sizes[`${props.variant}-${props.size}`] + 'px')};
    &:hover {
      background-color: ${(props: TIconButtonProps) => props.variant === 'plain' ?
    'transparent' : getHoverColor(props)};
    }
    &:active {
      ${StyledIcon} {
        color: ${(props: TIconButtonProps) => getMainColor(props)}
      }
    }
  }
`;

const IconButton: React.SFC<TIconButtonProps> = (
  props: TIconButtonProps,
) => {
  const { children, tooltipTitle, innerRef, ...rest } = props;
  const main = (
    <StyledIconButton disableRipple={rest.variant === 'plain'} {...rest}>
      <StyledIcon {...rest}>{children}</StyledIcon>
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
