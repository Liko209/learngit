/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-31 19:37:49
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled, { keyframes } from '../../../foundation/styled-components';
import MuiCheckbox, { CheckboxProps } from '@material-ui/core/Checkbox';
import { JuiIconography, SvgSymbol } from '../../../foundation/Iconography';
import { palette, grey, width } from '../../../foundation/utils/styles';
import { parseColor } from '../../../foundation/utils/parseColor';
import tinycolor from 'tinycolor2';
import { Theme, Palette } from '../../../foundation/theme/theme';
import { RuiTooltip } from 'rcui/components/Tooltip';

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

type CheckboxButtonProps = {
  tooltipTitle?: string;
  invisible?: boolean;
  awake?: boolean;
  size?: 'small' | 'medium';
  color?: string;
} & Omit<CheckboxProps, 'color' | 'size'>;

type JuiCheckboxButtonProps = CheckboxButtonProps & {
  iconName: string;
  checkedIconName: string;
  checkedIcon?: SvgSymbol;
  icon?: SvgSymbol;
};

const iconSizes = {
  medium: 5,
  small: 4,
};

const rippleEnter = ({ theme }: { theme: Theme }) => keyframes`
  from {
    transform: scale(0);
    opacity: 0.1;
  }
  to {
    transform: scale(1);
    opacity: ${theme.palette.action.hoverOpacity * 2};
  }
`;
const touchRippleClasses = {
  rippleVisible: 'rippleVisible',
};

const StyledIcon = styled(JuiIconography)``;
const WrappedMuiCheckboxButton = ({
  invisible,
  awake,
  colorScope,
  colorName,
  ...rest
}: CheckboxButtonProps & {
  colorScope: keyof Palette;
  colorName: string;
}) => (
  <MuiCheckbox
    {...rest}
    color={
      colorScope === 'primary' || colorScope === 'secondary'
        ? colorScope
        : 'default'
    }
    classes={{ disabled: 'disabled' }}
    TouchRippleProps={{ classes: touchRippleClasses }}
  />
);
const StyledCheckboxButton = styled<
  CheckboxButtonProps & {
    colorScope: keyof Palette;
    colorName: string;
  }
>(WrappedMuiCheckboxButton)`
  && {
    padding: 0;
    width: ${({ size = 'medium', theme }) =>
      width(iconSizes[size] * 2)({ theme })};
    height: ${({ size = 'medium', theme }) =>
      width(iconSizes[size] * 2)({ theme })};
    opacity: ${({ invisible }) => (invisible ? 0 : 1)};
    color: ${({ colorScope, colorName, theme, checked }) =>
      checked ? palette(colorScope, colorName)({ theme }) : 'grey'};
    font-size: ${({ size = 'medium', theme }) =>
      width(iconSizes[size])({ theme })};
    &:hover {
      background-color: ${({ theme, checked, colorScope, colorName }) =>
        checked
          ? tinycolor(palette(colorScope, colorName)({ theme }))
              .setAlpha(theme.palette.action.hoverOpacity)
              .toRgbString()
          : tinycolor(grey('500')({ theme }))
              .setAlpha(theme.palette.action.hoverOpacity)
              .toRgbString()};
    }
    &:active {
      color: ${({ theme, colorScope, colorName, checked }) =>
        checked
          ? palette(colorScope, colorName)({ theme })
          : grey('500')({ theme })};
    }

    &.disabled {
      ${StyledIcon} {
        color: ${() => palette('action', 'disabledBackground')};
      }
    }

    ${StyledIcon} {
      font-size: inherit;
    }

    .rippleVisible {
      opacity: ${({ theme }) => theme.palette.action.hoverOpacity * 2};
      transform: scale(1);
      animation-name: ${rippleEnter};
    }
  }
`;

// Tooltip does not work on disabled CheckboxButton without this: https://github.com/mui-org/material-ui/issues/8416
const WrapperForTooltip = styled('div')<{ size: CheckboxButtonProps['size'] }>`
  display: inline-block;
  width: ${({ size = 'medium', theme }) =>
    width(iconSizes[size] * 2)({ theme })};
  height: ${({ size = 'medium', theme }) =>
    width(iconSizes[size] * 2)({ theme })};
  font-size: 0;
`;

class JuiCheckboxButton extends React.PureComponent<JuiCheckboxButtonProps> {
  static defaultProps = {
    color: 'primary',
    size: 'medium',
    invisible: false,
    tooltipTitle: '',
    iconName: 'check_box_outline_blank',
    checkedIconName: 'check_box',
  };
  static dependencies = [MuiCheckbox, JuiIconography, RuiTooltip];
  state = {
    checked: false,
  };

  changeHandler = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    this.setState({ checked });
    this.props.onChange && this.props.onChange(event, checked);
  };

  render() {
    const {
      className,
      iconName,
      checkedIconName,
      tooltipTitle,
      innerRef,
      onChange,
      color,
      checkedIcon,
      icon,
      size,
      ...rest
    } = this.props;

    const colorObj = parseColor(color);

    return (
      <RuiTooltip title={tooltipTitle}>
        <WrapperForTooltip className={className} size={size}>
          <StyledCheckboxButton
            onChange={this.changeHandler}
            checked={this.state.checked}
            icon={<StyledIcon symbol={icon}>{iconName}</StyledIcon>}
            colorScope={colorObj.scope}
            colorName={colorObj.name}
            checkedIcon={
              <StyledIcon symbol={checkedIcon}>{checkedIconName}</StyledIcon>
            }
            size={size}
            {...rest}
          />
        </WrapperForTooltip>
      </RuiTooltip>
    );
  }
}

export { JuiCheckboxButton, JuiCheckboxButtonProps, CheckboxButtonProps };
