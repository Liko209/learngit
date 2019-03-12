/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-03-12 09:59:42
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import InputBase, { InputBaseProps } from '@material-ui/core/InputBase';
import styled, { css } from '../../../foundation/styled-components';
import {
  grey,
  spacing,
  typography,
  height,
  width,
  primary,
  disabled,
} from '../../../foundation/utils';
import { HeightSize } from './types';

const CLASSES_INPUT_BASE = {
  root: 'root',
  focused: 'focused',
  disabled: 'disabled',
};

type Props = InputBaseProps & {
  heightSize: HeightSize;
};

const Input = ({ heightSize, ...rest }: Props) => <InputBase {...rest} />;

const StyledInput = styled<Props>(Input)`
  &.root {
    height: ${height(8)};
    box-sizing: border-box;
    border-radius: ${spacing(1)};
    background-color: ${grey('200')};
    border: 1px solid ${grey('200')};
    ${typography('body1')};
    color: ${grey('900')};
    width: ${width(50)};
    ${({ heightSize }: Props) => {
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
  }

  &:hover {
    background-color: ${grey('100')};
    border: 1px solid ${grey('100')};
  }
  &.disabled {
    ${disabled}
  }
  &.focused {
    background-color: ${grey('200')};
    border: 1px solid ${primary('700')};
  }
`;

export { StyledInput, CLASSES_INPUT_BASE };
