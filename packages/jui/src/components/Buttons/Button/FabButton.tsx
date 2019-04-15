/*
 * @Author: Looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-02-28 13:24:02
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { darken, lighten } from '@material-ui/core/styles/colorManipulator';
import Fab, { FabProps as MuiFabProps } from '@material-ui/core/Fab';
import { TooltipProps } from '@material-ui/core/Tooltip';
import { JuiCircularProgress } from '../../Progress';
import styled from '../../../foundation/styled-components';
import { Palette } from '../../../foundation/theme/theme';
import {
  typography,
  palette,
  width,
  rippleEnter,
  height,
} from '../../../foundation/utils/styles';
import { JuiArrowTip } from '../../Tooltip/ArrowTip';
import { Omit } from '../../../foundation/utils/typeHelper';
import {
  ICON_NAME,
  JuiIconography,
  IconSize,
  IconColor,
} from '../../../foundation/Iconography';

type IconButtonSize = 'small' | 'medium' | 'large' | 'moreLarge';

type ButtonProps = {
  size?: IconButtonSize;
  iconName: ICON_NAME;
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
};

type Size = 'small' | 'medium' | 'large' | 'moreLarge';

const buttonSizes: { [k in Size]: number } = {
  moreLarge: 16,
  large: 15,
  medium: 8,
  small: 5,
};

const buttonShadows: { [k in Size]: string } = {
  moreLarge: 'val16',
  large: 'val16',
  medium: 'val1',
  small: 'val1',
};

const iconSizesMap: { [k in Size]: IconSize } = {
  large: 'large',
  moreLarge: 'moreLarge',
  medium: 'small',
  small: 'extraSmall',
};

const touchRippleClasses = {
  rippleVisible: 'rippleVisible',
};

const StyledMuiFab = styled(Fab)`
  && {
    min-height: 0;
  }
`;

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
    <StyledMuiFab
      TouchRippleProps={{ classes: touchRippleClasses }}
      {...restProps}
    >
      {loading ? <JuiCircularProgress size={20} /> : children}
    </StyledMuiFab>
  );
};

const StyledFabButton = styled<StyledFabButtonProps>(
  ({ showShadow, ...rest }) => <WrappedMuiFab {...rest} />,
)`
  && {
    background-color: ${({ theme, colorScope, colorName }) =>
      palette(colorScope, colorName)({ theme })};
    width: ${({ size = 'large', theme }) =>
      width(buttonSizes[size])({ theme })};
    height: ${({ size = 'large', theme }) =>
      height(buttonSizes[size])({ theme })};
    box-shadow: ${({ showShadow, theme, size = 'large' }) =>
      showShadow ? theme.boxShadow[buttonShadows[size]] : 'none'};
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
        showShadow ? theme.boxShadow.val16 : 'none'};
      opacity: ${({ theme }) => theme.palette.action.hoverOpacity};
    }
  }
`;

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
    ...rest
  } = props;
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

  if (!disabled && !disableToolTip && tooltipTitle) {
    return (
      <JuiArrowTip title={tooltipTitle} placement={tooltipPlacement}>
        {
          <StyledFabButton
            colorScope={colorScope}
            colorName={colorName}
            size={size}
            {...rest}
          >
            <JuiIconography iconColor={iconColor} iconSize={iconSizesMap[size]}>
              {iconName}
            </JuiIconography>
          </StyledFabButton>
        }
      </JuiArrowTip>
    );
  }
  return (
    <StyledFabButton
      disabled={disabled}
      colorScope={colorScope}
      colorName={colorName}
      size={size}
      {...rest}
    >
      <JuiIconography iconColor={iconColor} iconSize={iconSizesMap[size]}>
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

const JuiFabButton = styled(React.memo(JuiFabButtonComponent))``;

export { JuiFabButton, JuiFabProps };
