/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-22 15:22:51
 * Copyright © RingCentral. All rights reserved.
 */
import React, { RefObject, memo, ReactNode, useMemo } from 'react';
import MuiIconButton, {
  IconButtonProps as MuiIconButtonProps,
} from '@material-ui/core/IconButton';
import { RuiTooltip } from 'rcui/components/Tooltip';
import { TooltipProps } from '@material-ui/core/Tooltip';
import {
  JuiIconography,
  JuiIconographyProps,
  SvgSymbol,
} from '../../../foundation/Iconography';
import tinycolor from 'tinycolor2';
import styled, { keyframes } from '../../../foundation/styled-components';
import { palette, width } from '../../../foundation/utils/styles';
import { useHoverHelper } from '../../../foundation/hooks/useHoverHelper';
import { useShallowDependency } from '../../../foundation/hooks/useShallowDependency';
import { Theme, Palette } from '../../../foundation/theme/theme';
import { parseColor } from '../../../foundation/utils/parseColor';

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

type IconButtonVariant = 'round' | 'plain';
type IconButtonSize =
  | 'small'
  | 'medium'
  | 'large'
  | 'xlarge'
  | 'xxlarge'
  | 'xxxlarge';

type JuiIconButtonProps = {
  shouldPersistBg?: boolean;
  tooltipTitle?: string;
  tooltipForceHide?: boolean;
  invisible?: boolean;
  awake?: boolean;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  color?: string;
  disableToolTip?: boolean;
  alwaysEnableTooltip?: boolean;
  ariaLabel?: string;
  innerRef?: RefObject<HTMLElement>;
  ref?: any;
  children?: ReactNode;
  icon?: SvgSymbol;
  stretchIcon?: boolean;
  tooltipPlacement?: TooltipProps['placement'];
  component?: React.ElementType;
  download?: boolean;
  buttonRef?: React.RefObject<HTMLButtonElement>;
  href?: string;
} & Omit<MuiIconButtonProps, 'color' | 'children' | 'size'> &
  Omit<JuiIconographyProps, 'color' | 'children'>;

const iconSizes = {
  xxxlarge: 12,
  xxlarge: 8,
  xlarge: 7,
  large: 6,
  medium: 5,
  small: 4,
};

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

const MUI_ICON_BUTTON_CLASSES = { disabled: 'disabled' };

const TOUCH_RIPPLE_PROPS = { classes: touchRippleClasses };

const WrappedMuiIconButton = React.forwardRef(
  (
    {
      invisible,
      awake,
      color,
      colorName,
      colorScope,
      alwaysEnableTooltip,
      tooltipForceHide,
      tooltipPlacement,
      stretchIcon,
      shouldPersistBg,
      size,
      ...rest
    }: StyledIconButtonProps,
    ref,
  ) => <MuiIconButton {...rest} ref={ref as any} />,
);

const StyledIconButton = styled(WrappedMuiIconButton)`
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
    ${({ variant, size = 'medium', theme, stretchIcon }) =>
      stretchIcon
        ? `font-size: ${width(
            variant === 'round' ? iconSizes[size] * 2 : iconSizes[size],
          )({
            theme,
          })};`
        : ''}
    color: ${({ theme, colorScope, colorName }) =>
      palette(colorScope, colorName)({ theme })};
    opacity: ${({ invisible }) => (invisible ? 0 : 1)};
    padding: 0;
    background-color: ${({ shouldPersistBg, theme, colorScope, colorName }) =>
      shouldPersistBg
        ? tinycolor(palette(colorScope, colorName)({ theme }))
            .setAlpha(theme.palette.action.hoverOpacity)
            .toRgbString()
        : 'inherit'};
    border-radius: ${({ variant }) => (variant === 'round' ? '50%' : '0')};

    .icon {
      &, svg {
        font-size: ${({ size = 'medium', theme, stretchIcon, variant }) =>
          stretchIcon
            ? width(
                variant === 'round' ? iconSizes[size] * 2 : iconSizes[size],
              )({
                theme,
              })
            : width(iconSizes[size])({ theme })};
      }
    }
    &:hover {
      background-color: ${({ theme, variant, colorScope, colorName }) =>
        variant === 'plain'
          ? 'transparent'
          : tinycolor(palette(colorScope, colorName)({ theme }))
              .setAlpha(theme.palette.action.hoverOpacity)
              .toRgbString()};
       .icon {
        color: ${({ theme, colorScope, colorName }) =>
          tinycolor(palette(colorScope, colorName)({ theme }))
            .setAlpha(1 - theme.palette.action.hoverOpacity)
            .toRgbString()};
      }
    }
    &:active {
      .icon {
        color: ${({ theme, colorScope, colorName }) =>
          palette(colorScope, colorName)({ theme })};
      }
    }

    &&.disabled {
      .icon {
        color: ${palette('action', 'disabledBackground')};
      }
      background-color: ${({ shouldPersistBg, theme, colorScope, colorName }) =>
        shouldPersistBg
          ? tinycolor(palette(colorScope, colorName)({ theme }))
              .setAlpha(theme.palette.action.hoverOpacity)
              .toRgbString()
          : 'inherit'};
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
    buttonRef,
    className,
    children,
    tooltipTitle,
    tooltipForceHide,
    color,
    disableToolTip = false,
    disableTouchRipple = false,
    alwaysEnableTooltip = false,
    tooltipPlacement,
    ariaLabel,
    symbol,
    ...rest
  } = props;
  const colorObj = parseColor(color);
  const hoverHelper = useHoverHelper();

  const icon = useMemo(
    () => <JuiIconography symbol={symbol}>{children as string}</JuiIconography>,
    [symbol, children],
  );

  let iconButton = useMemo(
    () => (
      <StyledIconButton
        ref={buttonRef}
        disableRipple={disableTouchRipple || rest.variant === 'plain'}
        colorScope={colorObj.scope}
        colorName={colorObj.name}
        aria-label={ariaLabel || tooltipTitle}
        className={className}
        classes={MUI_ICON_BUTTON_CLASSES}
        TouchRippleProps={TOUCH_RIPPLE_PROPS}
        {...hoverHelper.TriggerProps}
        {...rest}
      >
        {icon}
      </StyledIconButton>
    ),
    [
      disableTouchRipple,
      ariaLabel,
      tooltipTitle,
      icon,
      useShallowDependency(colorObj),
      useShallowDependency(rest),
    ],
  );

  if (alwaysEnableTooltip) {
    iconButton = <span {...hoverHelper.TriggerProps}>{iconButton}</span>;
  }

  if (!disableToolTip && tooltipTitle && hoverHelper.hovered) {
    return (
      <RuiTooltip
        title={tooltipTitle}
        tooltipForceHide={tooltipForceHide}
        placement={tooltipPlacement}
      >
        {iconButton}
      </RuiTooltip>
    );
  }

  return iconButton;
};

JuiIconButtonComponent.displayName = 'JuiIconButton';
JuiIconButtonComponent.defaultProps = {
  variant: 'round',
  color: 'grey.500',
  size: 'medium',
  invisible: false,
  tooltipTitle: '',
  shouldPersistBg: false,
  stretchIcon: false,
};

const JuiIconButton = memo(JuiIconButtonComponent);

export {
  JuiIconButton,
  JuiIconButtonProps,
  IconButtonVariant,
  IconButtonSize,
  iconSizes,
};
