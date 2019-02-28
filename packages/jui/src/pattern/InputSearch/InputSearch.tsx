/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-02-28 10:50:37
 * Copyright © RingCentral. All rights reserved.
 */

import React, { PureComponent } from 'react';
import styled from '../../foundation/styled-components';
import Paper, { PaperProps } from '@material-ui/core/Paper';
import InputBase, { InputBaseProps } from '@material-ui/core/InputBase';
import {
  grey,
  palette,
  spacing,
  height,
  typography,
  width,
} from '../../foundation/utils';
import { JuiIconography } from '../../foundation/Iconography';

const CLASSES_PAPER = { root: 'root' };
const StyledPaper = styled<PaperProps>(Paper)`
  &.root {
    display: flex;
    position: relative;
    height: ${height(10)};
  }
`;

const CLASSES_INPUT_BASE = { root: 'root', focused: 'focused' };
const StyledInput = styled<InputBaseProps>(InputBase)`
  &.root {
    flex: 1;
    padding-left: ${height(10)};
    background-color: ${palette('common', 'white')};
    border: 1px solid ${grey('300')};
    border-radius: ${spacing(1)};
    ${typography('body1')};
    color: ${grey('900')};
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
  left: ${spacing(3)};
  top: ${spacing(2)};
  width: ${width(5)};
  height: ${height(5)};
`;

type Props = {
  placeholder: string;
};

class JuiInputSearch extends PureComponent<Props> {
  render() {
    const { placeholder } = this.props;
    return (
      <StyledPaper elevation={0} classes={CLASSES_PAPER}>
        <StyledIcon>search</StyledIcon>
        <StyledInput placeholder={placeholder} classes={CLASSES_INPUT_BASE} />
      </StyledPaper>
    );
  }
}

export { JuiInputSearch };
