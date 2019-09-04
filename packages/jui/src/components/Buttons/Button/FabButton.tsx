/*
 * @Author: Looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-02-28 13:24:02
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { darken, lighten } from '@material-ui/core/styles/colorManipulator';
import Fab, { FabProps as MuiFabProps } from '@material-ui/core/Fab';
import { TooltipProps } from '@material-ui/core/Tooltip';
import { RuiCircularProgress } from 'rcui/components/Progress';
import RootRef from '@material-ui/core/RootRef';
import styled from '../../../foundation/styled-components';
import { Palette } from '../../../foundation/theme/theme';
import {
  typography,
  palette,
  width,
  rippleEnter,
  height,
} from '../../../foundation/utils/styles';
import { RuiTooltip } from 'rcui/components/Tooltip';
import { Omit } from '../../../foundation/utils/typeHelper';
import {
  ICON_NAME,
  JuiIconography,
  IconSize,
  IconColor,
  SvgSymbol,
} from '../../../foundation/Iconography';
import { parseColor } from '../../../foundation/utils/parseColor';

type IconButtonSize =
  | 'small'
  | 'medium'
  | 'large'
  | 'midLarge'
  | 'moreLarge'
  | 'mediumLarge'
  | 'smallMedium';

// TODO: remove iconname prop
type ButtonProps = {
  size?: IconButtonSize;
  iconName?: ICON_NAME;
  icon?: SvgSymbol;
  tooltipTitle?: string;
  disableToolTip?: boolean;
  disabled?: boolean;
  color?: string;
  loading?: boolean;
  showShadow?: boolean;
  tooltipPlacement?: TooltipProps['placement'];
  iconColor?: IconColor;
};

type JuiFabProps = Omit<
  MuiFabProps,
  'innerRef' | 'variant' | 'color' | 'size'
> &
  ButtonProps;

type StyledFabButtonProps = Omit<JuiFabProps, 'iconName'> & {
  colorName: string;
  colorScope: keyof Palette;
  ref?: React.Ref<any>;
  children: React.ReactNode;
};

type Size =
  | 'small'
  | 'medium'
  | 'large'
  | 'moreLarge'
  | 'mediumLarge'
  | 'smallMedium';
type ButtonSize = Size | 'midLarge' | 'mediumLarge' | 'smallMedium';

const buttonSizes: { [k in ButtonSize]: number } = {
  moreLarge: 16,
  midLarge: 14,
  large: 15,
  mediumLarge: 12,
  medium: 8,
  smallMedium: 7,
  small: 5,
};

const buttonShadows: { [k in Size]: number } = {
  mediumLarge: 16,
  moreLarge: 16,
  large: 16,
  medium: 1,
  smallMedium: 1,
  small: 1,
};

const iconSizesMap: { [k in Size]: IconSize } = {
  large: 'large',
  moreLarge: 'moreLarge',
  medium: 'small',
  small: 'extraSmall',
  mediumLarge: 'large',
  smallMedium: 'small',
};

const touchRippleClasses = {
  rippleVisible: 'rippleVisible',
};

const WrappedMuiFab = (props: StyledFabButtonProps) => {
  const {
    color,
    children,
    loading,
    colorName,
    colorScope,
    size,
    ...restProps
  } = props;
  return (
    <Fab TouchRippleProps={{ classes: touchRippleClasses }} {...restProps}>
      {loading ? <RuiCircularProgress size={20} /> : children}
    </Fab>
  );
};

const StyledFabButton = styled<StyledFabButtonProps>(
  ({ showShadow, ...rest }) => <WrappedMuiFab {...rest} />,
)`
  && {
    min-height: 0;
    background-color: ${({ theme, colorScope, colorName }) =>
      palette(colorScope, colorName)({ theme })};
    width: ${({ size = 'large', theme }) =>
      width(buttonSizes[size])({ theme })};
    height: ${({ size = 'large', theme }) =>
      height(buttonSizes[size])({ theme })};
    box-shadow: ${({ showShadow, theme, size = 'large' }) =>
      showShadow ? theme.shadows[buttonShadows[size]] : 'none'};
    ${typography('caption1')};
    color: ${({ theme, colorScope, colorName }) =>
      theme.palette.getContrastText(palette(colorScope, colorName)({ theme }))};
    &:hover,
    &:active {
      background-color: ${({ theme, colorScope, colorName }) =>
        darken(palette(colorScope, colorName)({ theme }), 0.1)};
    }
    .rippleVisible {
      color: ${({ theme, colorScope, colorName }) =>
        lighten(palette(colorScope, colorName)({ theme }), 0.2)};
      opacity: ${({ theme }) => theme.palette.action.hoverOpacity * 2};
      transform: scale(1);
      animation-name: ${({ theme }) => rippleEnter(theme)};
    }
    &[disabled] {
      background-color: ${({ theme, colorScope, colorName }) =>
        palette(colorScope, colorName)({ theme })};
      color: ${({ theme, colorScope, colorName }) =>
        theme.palette.getContrastText(
          palette(colorScope, colorName)({ theme }),
        )};
      box-shadow: ${({ showShadow, theme }) =>
        showShadow ? theme.shadows[16] : 'none'};
      opacity: ${({ theme }) => theme.opacity[1] * 3};
    }
  }
`;

const StyledFabButtonWithRef = React.forwardRef(
  (props: StyledFabButtonProps, ref) => {
    const FabButton = <StyledFabButton {...props} />;
    if (ref) {
      return <RootRef rootRef={ref}>{FabButton}</RootRef>;
    }
    return FabButton;
  },
);

const JuiFabButtonComponent: React.StatelessComponent<JuiFabProps> = (
  props: JuiFabProps,
) => {
  const {
    disableToolTip,
    tooltipTitle,
    tooltipPlacement,
    color,
    disabled,
    iconName,
    iconColor,
    size = 'large',
    icon,
    ...rest
  } = props;
  const colorObj = parseColor(color);

  if (!disabled && !disableToolTip && tooltipTitle) {
    return (
      <RuiTooltip title={tooltipTitle} placement={tooltipPlacement}>
        <StyledFabButtonWithRef
          colorScope={colorObj.scope}
          colorName={colorObj.name}
          size={size}
          {...rest}
        >
          <JuiIconography
            symbol={icon}
            iconColor={iconColor}
            iconSize={iconSizesMap[size]}
          >
            {iconName}
          </JuiIconography>
        </StyledFabButtonWithRef>
      </RuiTooltip>
    );
  }
  return (
    <StyledFabButton
      disabled={disabled}
      colorScope={colorObj.scope}
      colorName={colorObj.name}
      size={size}
      {...rest}
    >
      <JuiIconography
        symbol={icon}
        iconColor={iconColor}
        iconSize={iconSizesMap[size]}
      >
        {iconName}
      </JuiIconography>
    </StyledFabButton>
  );
};

JuiFabButtonComponent.defaultProps = {
  size: 'large',
  color: 'common.white',
  disabled: false,
  tooltipTitle: '',
  tooltipPlacement: 'bottom',
  showShadow: true,
  disableToolTip: false,
};

const JuiFabButton = React.memo(JuiFabButtonComponent);

export { JuiFabButton, JuiFabProps };
