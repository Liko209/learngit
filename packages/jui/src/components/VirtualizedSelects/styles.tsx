/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-07-30 09:38:13
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import InputBase, { InputBaseProps } from '@material-ui/core/InputBase';
import styled, { css } from '../../foundation/styled-components';
import {
  disabled,
  grey,
  height,
  primary,
  spacing,
  typography,
  width,
  palette,
} from '../../foundation/utils/styles';
import { ArrowDropDownIcon } from './ArrowDropDownIcon';
import { HeightSize } from '../Selects/BoxSelect/types';

type StyledSelectProps = InputBaseProps & {
  heightSize?: HeightSize;
};

const Input = ({ heightSize, ...rest }: StyledSelectProps) => (
  <InputBase {...rest} />
);

const StyledSelect = styled<StyledSelectProps>(Input)`
  position: relative;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  border-radius: ${spacing(1)};
  background-color: ${grey('200')};
  border: 1px solid ${grey('200')};
  ${typography('body1')};
  color: ${grey('900')};
  width: ${width(50)};
  height: ${height(8)};
  ${({ heightSize }: StyledSelectProps) => {
    if (heightSize === 'default') {
      return css`
        height: ${height(8)};
      `;
    }
    if (heightSize === 'large') {
      return css`
        height: ${height(10)};
      `;
    }
    return;
  }}

  &&:hover {
    background-color: ${grey('100')};
    border: 1px solid ${grey('100')};
  }

  &&:focus,
  &&.focused {
    background-color: ${grey('200')};
    border: 1px solid ${primary('700')};
    outline: none;
  }

  &&.disabled {
    ${disabled}
  }

  ${ArrowDropDownIcon} {
    color: ${grey('500')};
    position: absolute;
    right: 0;
    pointer-events: none;
  }

  .select-input {
    height: 100%;
    padding: 0;
    box-sizing: border-box;
  }
`;

const StyledInput = styled.div`
  && {
    font: inherit;
    color: currentColor;
    padding: ${spacing(1.5, 6, 1.5, 2)};
    width: 100%;
    height: 100%;
    border: 0;
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  &:focus {
    background-color: ${palette('grey', '0', 0.05)};
    outline: none;
  }
`;

export { StyledSelect, StyledInput };
