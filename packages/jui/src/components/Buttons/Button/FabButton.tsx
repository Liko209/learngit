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

type IconButtonSize = 'small' | 'medium' | 'large';

type ButtonProps = {
  size?: IconButtonSize;
  tooltipTitle?: string;
  disableToolTip?: boolean;
  disabled?: boolean;
  color?: string;
  loading?: boolean;
  showShadow?: boolean;
  tooltipPlacement?: TooltipProps['placement'];
};

type JuiFabProps = Omit<MuiFabProps, 'innerRef' | 'variant' | 'color'> &
  ButtonProps;

type StyledFabButtonProps = JuiFabProps & {
  colorName: string;
  colorScope: keyof Palette;
};

const iconSizes = {
  large: 8,
  medium: 7.5,
  small: 6,
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
    ...restProps
  } = props;
  return (
    <Fab TouchRippleProps={{ classes: touchRippleClasses }} {...restProps}>
      {loading ? <JuiCircularProgress size={20} /> : children}
    </Fab>
  );
};

const StyledFabButton = styled<StyledFabButtonProps>(
  ({ showShadow, ...rest }) => <WrappedMuiFab {...rest} />,
)`
  && {
    background-color: ${({ theme, colorScope, colorName }) =>
      palette(colorScope, colorName)({ theme })};
    width: ${({ size = 'medium', theme }) =>
      width(iconSizes[size] * 2)({
        theme,
      })};
    height: ${({ size = 'medium', theme }) =>
      height(iconSizes[size] * 2)({
        theme,
      })};
    box-shadow: ${({ showShadow, theme }) =>
      showShadow ? theme.boxShadow.val16 : 'none'};
    ${typography('caption1')};
    color: ${({ theme, colorScope, colorName }) =>
      theme.palette.getContrastText(palette(colorScope, colorName)({ theme }))};
    &:hover,
    &:active {
      background-color: ${({ theme, colorScope, colorName }) =>
        darken(palette(colorScope, colorName)({ theme }), 0.2)};
    }
    .rippleVisible {
      color: ${({ theme, colorScope, colorName }) =>
        lighten(palette(colorScope, colorName)({ theme }), 0.2)};
      opacity: ${({ theme }) => theme.palette.action.hoverOpacity * 2};
      transform: scale(1);
      animation-name: ${({ theme }) => rippleEnter(theme)};
    }
    .icon {
      svg {
        font-size: ${({ size = 'medium', theme }) =>
          width(iconSizes[size])({ theme })};
      }
      opacity: ${({ theme, disabled }) =>
        disabled ? theme.palette.action.hoverOpacity : 1};
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
            {...rest}
          />
        }
      </JuiArrowTip>
    );
  }
  return (
    <StyledFabButton
      disabled={disabled}
      colorScope={colorScope}
      colorName={colorName}
      {...rest}
    />
  );
};

JuiFabButtonComponent.defaultProps = {
  size: 'medium',
  color: 'common.white',
  disabled: false,
  tooltipTitle: '',
  tooltipPlacement: 'bottom',
  showShadow: true,
  disableToolTip: false,
};

const JuiFabButton = styled(React.memo(JuiFabButtonComponent))``;

export { JuiFabButton, JuiFabProps };
