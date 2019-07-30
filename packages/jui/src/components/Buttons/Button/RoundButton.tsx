/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-07-22 11:08:20
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import MuiButton, {
  ButtonProps as MuiButtonProps,
} from '@material-ui/core/Button';
import styled from '../../../foundation/styled-components';
import {
  typography,
  spacing,
  palette,
  width,
  rippleEnter,
  height,
  grey,
  primary,
} from '../../../foundation/utils/styles';

const StyledButton = styled(MuiButton)`
  && {
    min-width: ${({ theme }) => width(26)({ theme })};
    padding: ${spacing(2.5, 4)};
    display: flex;
    text-transform: none;
    ${typography('button')};
    color: ${palette('primary', 'main')};
    text-align: center;

    height: ${({ theme }) => height(7)({ theme })};
    border-radius: ${({ theme }) => spacing(7)({ theme })};
    padding: ${({ theme }) => spacing(0, 4)({ theme })};
    background-color: ${({ theme }) =>
      theme.palette.getContrastText(primary('700')({ theme }))};
    color: ${primary('700')};
    ${typography('caption1')};
    min-height: unset;
    width: inherit;
    box-shadow: ${({ theme }) => theme.shadows[3]};
    &:hover {
      background-color: ${grey('50')};
      &:active {
        box-shadow: ${({ theme }) => theme.shadows[1]};
        background-color: ${grey('100')};
      }
    }

    .rippleVisible {
      opacity: ${({ theme }) => theme.palette.action.hoverOpacity * 2};
      transform: scale(1);
      animation-name: ${({ theme }) => rippleEnter(theme)};
    }
  }
`;

export type JuiRoundButtonProps = {} & MuiButtonProps;

export function JuiRoundButton(props: JuiRoundButtonProps) {
  return <StyledButton disableRipple {...props} />;
}
