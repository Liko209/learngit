import React, { memo, ReactNode } from 'react';
import MuiIconButton from '@material-ui/core/IconButton';

import { RuiIconography, ICON_NAME } from '../../Iconography';
import { RuiTooltip } from '../../Tooltip';

import styled from '../../../foundation/styled-components';
import { palette } from '../../../foundation/shared/theme';
import { Palette } from '../../../foundation/styles';

import sizing, { IconButtonSize } from './utils/sizing';
import {
  rippleEnter,
  variantHoverStyle,
  reverseHoverStyle,
} from './utils/tools';

type IconButtonVariant = 'plain' | 'round' | 'toggle';

type RuiIconButtonProps = {
  tooltipTitle?: string;
  invisible?: boolean;
  variant: IconButtonVariant;
  size?: IconButtonSize;
  color?: string;
  disableToolTip?: boolean;
  awake?: boolean;
  ariaLabel?: string;
  children?: ReactNode;
  icon: ICON_NAME;
  className?: string;
  disabled?: boolean;
};

type StyledIconButtonProps = RuiIconButtonProps & {
  colorName: any;
  colorScope: keyof Palette;
  disableRipple: boolean;
};

const touchRippleClasses = {
  rippleVisible: 'rippleVisible',
};

const StyledIcon = styled(RuiIconography)``;

const WrappedMuiIconButton = ({
  invisible,
  color,
  colorName,
  colorScope,
  awake,
  icon,
  ...rest
}: StyledIconButtonProps) => (
    <MuiIconButton
      {...rest}
      classes={{ disabled: 'disabled' }}
      TouchRippleProps={{ classes: touchRippleClasses }}
    />
  );

const StyledIconButton = styled(WrappedMuiIconButton)`
  && {
    padding: 0;
    width: ${({ size = 'medium', awake }) =>
    awake ? sizing(size, 2) : sizing(size, 1)};
    height: ${({ size = 'medium', awake }) =>
    awake ? sizing(size, 2) : sizing(size, 1)};
    color: ${({ theme, colorScope, colorName }) =>
    palette(colorScope, colorName)({ theme })};
    opacity: ${({ invisible }) => (invisible ? 0 : 1)};
    padding: 0;
    ${StyledIcon} {
      &,
      svg {
        font-size: ${({ size = 'medium' }) => sizing(size)};
      }
    }
    &:hover {
      background-color: ${({ variant, colorScope, colorName, theme, awake }) =>
    awake
      ? variantHoverStyle(variant, colorScope, colorName, theme)
      : 'transparent'};
      ${StyledIcon} {
        color: ${({ theme, colorScope, colorName, awake }) =>
    awake && reverseHoverStyle(colorScope, colorName, theme)};
      }
    }
    &:active {
      ${StyledIcon} {
        color: ${({ theme, colorScope, colorName }) =>
    palette(colorScope, colorName)({ theme })};
      }
    }

    &&.disabled {
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

const RuiIconButtonComponent: React.SFC<RuiIconButtonProps> = (
  props: RuiIconButtonProps,
) => {
  const {
    className,
    children,
    tooltipTitle,
    color,
    disableToolTip = false,
    ariaLabel,
    icon,
    ...rest
  } = props;
  const { variant } = rest;
  let colorScope: keyof Palette = 'primary';
  let colorName: string | number = 'main';
  if (color) {
    const array = color.split('.');
    if (array.length > 1) {
      colorScope = array[0] as keyof Palette;
      colorName = /^\d+$/.test(array[1]) ? Number(array[1]) : array[1];
    } else {
      colorScope = array[0] as keyof Palette;
      colorName = 'main';
    }
  }
  const renderIconButton = () => {
    return (
      <StyledIconButton
        disableRipple={variant === 'plain'}
        colorScope={colorScope}
        colorName={colorName}
        aria-label={ariaLabel}
        className={className}
        icon={icon}
        {...rest}
      >
        <StyledIcon icon={icon} />
      </StyledIconButton>
    );
  };
  if (!disableToolTip && tooltipTitle) {
    return (
      <RuiTooltip title={tooltipTitle} placement="top">
        {renderIconButton()}
      </RuiTooltip>
    );
  }
  return renderIconButton();
};

RuiIconButtonComponent.defaultProps = {
  variant: 'round',
  color: 'grey.500',
  size: 'medium',
  invisible: false,
  tooltipTitle: '',
  disableToolTip: false,
  disabled: false,
  awake: true,
};

const RuiIconButton = memo(RuiIconButtonComponent);
export { RuiIconButtonProps, IconButtonVariant, IconButtonSize };
export default RuiIconButton;
