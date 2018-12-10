/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-31 19:37:49
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled, { keyframes } from '../../../foundation/styled-components';
import MuiCheckbox, { CheckboxProps } from '@material-ui/core/Checkbox';
import { Icon as MuiIcon } from '@material-ui/core';
import { palette, grey, width } from '../../../foundation/utils/styles';
import tinycolor from 'tinycolor2';
import { Theme, Palette } from '../../../foundation/theme/theme';
import { JuiArrowTip } from '../../../components/Tooltip/ArrowTip';

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type JuiCheckboxButtonProps = {
  tooltipTitle?: string;
  invisible?: boolean;
  awake?: boolean;
  size?: 'small' | 'medium' | 'large';
  iconName?: string;
  color?: string;
  checkedIconName?: string;
} & Omit<CheckboxProps, 'color'>;

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

const StyledIcon = styled(MuiIcon)``;
const WrappedMuiCheckboxButton = ({
  invisible,
  awake,
  colorScope,
  ...rest
}: JuiCheckboxButtonProps & {
  colorScope: keyof Palette;
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
  JuiCheckboxButtonProps & {
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
const WrapperForTooltip = styled<JuiCheckboxButtonProps, 'div'>('div')`
  display: inline-block;
  width: ${({ size = 'medium', theme }) =>
    width(iconSizes[size] * 2)({ theme })};
  height: ${({ size = 'medium', theme }) =>
    width(iconSizes[size] * 2)({ theme })};
  font-size: 0;
`;

class JuiCheckboxButton extends React.Component<
  JuiCheckboxButtonProps,
  { checked: boolean }
> {
  static defaultProps = {
    color: 'primary',
    size: 'medium',
    invisible: false,
    tooltipTitle: '',
    iconName: 'check_box_outline_blank',
    checkedIconName: 'check_box',
  };

  static dependencies = [MuiCheckbox, MuiIcon, JuiArrowTip];

  constructor(props: JuiCheckboxButtonProps) {
    super(props);
    this.changeHandler = this.changeHandler.bind(this);
    this.state = {
      checked: false,
    };
  }

  changeHandler(event: React.ChangeEvent<HTMLInputElement>, checked: boolean) {
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
      <JuiArrowTip title={tooltipTitle}>
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
      </JuiArrowTip>
    );
  }
}

export { JuiCheckboxButton, JuiCheckboxButtonProps };
