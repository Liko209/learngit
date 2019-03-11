/*
 * @Author: Looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-02-28 13:24:02
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import Fab, { FabProps as MuiFabProps } from '@material-ui/core/Fab';
import { JuiCircularProgress } from '../../Progress';
import styled from '../../../foundation/styled-components';
import {
  typography,
  palette,
  width,
  rippleEnter,
  height,
} from '../../../foundation/utils/styles';
import { JuiArrowTip } from '../../Tooltip/ArrowTip';
import { Omit } from '../../../foundation/utils/typeHelper';

type JuiButtonColor = 'primary' | 'secondary' | 'negative';

type ButtonProps = {
  size?: 'small' | 'large';
  tooltipTitle?: string;
  disableToolTip?: boolean;
  disabled?: boolean;
  color?: JuiButtonColor;
  loading?: boolean;
};

type JuiFabProps = Omit<MuiFabProps, 'innerRef' | 'variant' | 'color'> &
  ButtonProps;

const touchRippleClasses = {
  rippleVisible: 'rippleVisible',
};

const WrappedMuiFab = (props: JuiFabProps) => {
  const { color, children, loading, ...restProps } = props;
  return (
    <Fab TouchRippleProps={{ classes: touchRippleClasses }} {...restProps}>
      {loading ? <JuiCircularProgress size={20} /> : children}
    </Fab>
  );
};

const StyledFabButton = styled<JuiFabProps>(WrappedMuiFab)`
  && {
    background-color: ${palette('common', 'white')};
    height: ${({ theme }) => height(15)({ theme })};
    width: ${({ theme }) => width(15)({ theme })};
    box-shadow: ${props => props.theme.shadows[16]};
    ${typography('caption1')};
    &:hover,
    &:active {
      opacity: ${({ theme }) =>
        1 - (theme.palette.action.hoverOpacity * 2) / 3};
    }
    .rippleVisible {
      opacity: ${({ theme }) => theme.palette.action.hoverOpacity * 2};
      transform: scale(1);
      animation-name: ${({ theme }) => rippleEnter(theme)};
    }
    &.disabled {
      background-color: ${palette('common', 'white')};
      opacity: ${({ theme }) => theme.palette.action.hoverOpacity * 2};
    }
  }
`;

const JuiFabButtonComponent: React.StatelessComponent<JuiFabProps> = (
  props: JuiFabProps,
) => {
  const { disableToolTip, tooltipTitle, disabled, ...rest } = props;
  if (!disableToolTip && !disabled) {
    return (
      <JuiArrowTip title={tooltipTitle}>
        <StyledFabButton disabled={disabled} {...rest} />
      </JuiArrowTip>
    );
  }
  return <StyledFabButton disabled={disabled} {...rest} />;
};

JuiFabButtonComponent.defaultProps = {
  size: 'large',
  color: 'primary',
  disabled: false,
};

const JuiFabButton = styled(React.memo(JuiFabButtonComponent))``;

export { JuiFabButton, JuiFabProps };
