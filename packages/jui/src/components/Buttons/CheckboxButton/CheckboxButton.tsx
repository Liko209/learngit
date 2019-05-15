/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-31 19:37:49
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled, { keyframes } from '../../../foundation/styled-components';
import MuiCheckbox, { CheckboxProps } from '@material-ui/core/Checkbox';
import { JuiIconography } from '../../../foundation/Iconography';
import { palette, grey, width } from '../../../foundation/utils/styles';
import tinycolor from 'tinycolor2';
import { Theme, Palette } from '../../../foundation/theme/theme';
import { RuiTooltip } from 'rcui/components/Tooltip';

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type CheckboxButtonProps = {
  tooltipTitle?: string;
  invisible?: boolean;
  awake?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: string;
} & Omit<CheckboxProps, 'color'>;
type JuiCheckboxButtonProps = CheckboxButtonProps & {
  iconName: string;
  checkedIconName: string;
};

const iconSizes = {
  large: 6,
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
        color: ${({ theme }) => palette('action', 'disabledBackground')};
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
const WrapperForTooltip = styled<CheckboxButtonProps, 'div'>('div')`
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
  }

  render() {
    const {
      className,
      iconName,
      checkedIconName,
      tooltipTitle,
      innerRef,
      onChange,
      color,
      ...rest
    } = this.props;

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

    return (
      <RuiTooltip title={tooltipTitle}>
        <WrapperForTooltip className={className} {...rest}>
          <StyledCheckboxButton
            onChange={this.changeHandler}
            checked={this.state.checked}
            icon={<StyledIcon>{iconName}</StyledIcon>}
            colorScope={colorScope}
            colorName={colorName}
            checkedIcon={<StyledIcon>{checkedIconName}</StyledIcon>}
            {...rest}
          />
        </WrapperForTooltip>
      </RuiTooltip>
    );
  }
}

export { JuiCheckboxButton, JuiCheckboxButtonProps, CheckboxButtonProps };
