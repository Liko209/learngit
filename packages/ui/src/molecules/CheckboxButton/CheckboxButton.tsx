/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-31 19:37:49
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled, { keyframes } from '../../styled-components';
import MuiCheckbox, { CheckboxProps } from '@material-ui/core/Checkbox';
import { Icon as MuiIcon, Tooltip as MuiTooltip } from '@material-ui/core';
import { palette, grey, width } from '../../utils/styles';
import tinycolor from 'tinycolor2';
import { Theme } from '../../theme';

type JuiCheckboxButtonProps = {
  tooltipTitle?: string;
  invisible?: boolean;
  awake?: boolean;
  size?: 'small' | 'medium' | 'large';
  iconName?: string;
  color?: 'primary' | 'secondary';
  checkedIconName?: string;
} & CheckboxProps;

const iconSizes = {
  large: 2.4,
  medium: 2,
  small: 1.6,
};

const rippleEnter = (theme: Theme) => keyframes`
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
const WrappedMuiCheckboxButton = ({ invisible, awake, checked, ...rest }: JuiCheckboxButtonProps) => (
  <MuiCheckbox {...rest} TouchRippleProps={{ classes: touchRippleClasses }} />
);
const StyledCheckboxButton = styled<JuiCheckboxButtonProps>(WrappedMuiCheckboxButton)`
  && {
    width: ${({ size = 'medium', theme }) => width(iconSizes[size] * 2)({ theme })};
    height: ${({ size = 'medium', theme }) => width(iconSizes[size] * 2)({ theme })};
    opacity: ${({ invisible }) => invisible ? 0 : 1};
    color: ${({ awake, checked, color = 'primary', theme }) => checked ? palette(color, 'main')({ theme }) : awake ? grey('500')({ theme }) : palette('accent', 'ash')({ theme })};
    font-size: ${({ size = 'medium', theme }) => width(iconSizes[size])({ theme })};
    &:hover {
      background-color: ${({ theme, checked, color = 'primary' }) => checked ?
    tinycolor(palette(color, 'main')({ theme })).setAlpha(theme.palette.action.hoverOpacity).toRgbString() :
    tinycolor(grey('500')({ theme })).setAlpha(theme.palette.action.hoverOpacity).toRgbString()};
    }
    &:active {
      color: ${({ theme, color = 'primary' }) => palette(color, 'main')({ theme })};
    }

    ${StyledIcon} {
      font-size: inherit;
    }

    .rippleVisible {
      opacity: ${({ theme }) => theme.palette.action.hoverOpacity * 2};
      transform: scale(1);
      animation-name: ${({ theme }) => rippleEnter(theme)};
    }
  }
`;

// Tooltip does not work on disabled CheckboxButton without this: https://github.com/mui-org/material-ui/issues/8416
const WrapperForTooltip = styled<JuiCheckboxButtonProps, 'div'>('div')`
  display: inline-block;
  width: ${({ size = 'medium', theme }) => width(iconSizes[size] * 2)({ theme })};
  height: ${({ size = 'medium', theme }) => width(iconSizes[size] * 2)({ theme })};
  font-size: 0;
`;

class JuiCheckboxButton extends React.Component<JuiCheckboxButtonProps, { checked: boolean }> {

  static defaultProps = {
    color: 'primary',
    size: 'medium',
    invisible: false,
    tooltipTitle: '',
    iconName: 'check_box_outline_blank',
    checkedIconName: 'check_box',
  };

  static dependencies = [MuiCheckbox, MuiIcon, MuiTooltip];

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
    const { iconName, checkedIconName, tooltipTitle, innerRef, onChange, ...rest } = this.props;
    const icon = (
      <StyledIcon
      >{iconName}
      </StyledIcon>);
    const checkedIcon = (
      <StyledIcon
      >{checkedIconName}
      </StyledIcon>);
    return (
      <MuiTooltip title={tooltipTitle}>
        <WrapperForTooltip className="checkboxButtonWrapper" {...rest}>
          <StyledCheckboxButton onChange={this.changeHandler} checked={this.state.checked} icon={icon} checkedIcon={checkedIcon} {...rest} />
        </WrapperForTooltip>
      </MuiTooltip>
    );
  }
}

export { JuiCheckboxButton, JuiCheckboxButtonProps };
export default JuiCheckboxButton;
