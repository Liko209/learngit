/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-02-28 10:50:37
 * Copyright © RingCentral. All rights reserved.
 */

import React, { PureComponent } from 'react';
import styled, { css } from '../../../foundation/styled-components';
import Paper, { PaperProps } from '@material-ui/core/Paper';
import InputBase, { InputBaseProps } from '@material-ui/core/InputBase';
import {
  grey,
  palette,
  spacing,
  height,
  typography,
  width,
} from '../../../foundation/utils';
import { JuiIconography } from '../../../foundation/Iconography';

type IconPosition = 'left' | 'right';

const CLASSES_PAPER = { root: 'root' };
const StyledPaper = styled<PaperProps>(Paper)`
  &.root {
    display: flex;
    position: relative;
    height: ${height(10)};
  }
`;

type CompositeInputProps = InputBaseProps & {
  iconPosition?: IconPosition;
};
const CompositeInput = ({ iconPosition, ...rest }: CompositeInputProps) => (
  <InputBase {...rest} />
);

const CLASSES_INPUT_BASE = { root: 'root', focused: 'focused' };
const StyledInput = styled<CompositeInputProps>(CompositeInput)`
  &.root {
    flex: 1;
    background-color: ${palette('common', 'white')};
    border: 1px solid ${grey('300')};
    border-radius: ${spacing(1)};
    ${typography('body1')};
    color: ${grey('900')};
    padding: ${spacing(1.5, 3)};
    ${({ iconPosition }: CompositeInputProps) => {
      if (iconPosition === 'left') {
        return css`
          padding-left: ${height(10)};
        `;
      }
      if (iconPosition === 'right') {
        return css`
          padding-right: ${height(10)};
        `;
      }
      return;
    }}
  }
  &:hover {
    background-color: ${grey('50')};
  }
  &.focused {
    background-color: ${palette('common', 'white')};
    border: 1px solid ${grey('400')};
  }
`;

const StyledIcon = styled(JuiIconography)`
  color: ${grey('500')};
  padding: 0;
  position: absolute;
  top: ${spacing(2)};
  width: ${width(5)};
  height: ${height(5)};
`;
const StyledIconLeft = styled(StyledIcon)`
  left: ${spacing(3)};
`;
const StyledIconRight = styled(StyledIcon)`
  right: ${spacing(3)};
`;

type Props = {
  placeholder: string;
  iconPosition?: IconPosition;
  iconName?: string;
};

class JuiOutlineTextField extends PureComponent<Props> {
  render() {
    const { placeholder, iconName = '', iconPosition } = this.props;
    return (
      <StyledPaper elevation={0} classes={CLASSES_PAPER}>
        {iconPosition === 'left' && <StyledIconLeft>{iconName}</StyledIconLeft>}
        <StyledInput
          placeholder={placeholder}
          classes={CLASSES_INPUT_BASE}
          iconPosition={iconPosition}
        />
        {iconPosition === 'right' && (
          <StyledIconRight>{iconName}</StyledIconRight>
        )}
      </StyledPaper>
    );
  }
}

export { JuiOutlineTextField };
