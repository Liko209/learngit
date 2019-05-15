/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-18 14:00:05
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../../foundation/styled-components';
import MuiTextField, { TextFieldProps } from '@material-ui/core/TextField';
import isOutlinedTextFieldProps from '../isOutlinedTextFieldProps';

import {
  typography,
  grey,
  spacing,
  palette,
  height,
} from '../../../foundation/utils/styles';

type JuiTextFieldProps = TextFieldProps;

const WrappedMuiTextField = ({ ...textFieldRest }: JuiTextFieldProps) => (
  <MuiTextField {...textFieldRest} />
);

const Textarea = styled<JuiTextFieldProps>(WrappedMuiTextField)`
  && {
    textarea {
      height: ${height(18)};
      background: ${grey('100')};
      margin: ${spacing(2)} 0 0 0;
      box-sizing: border-box;
      font-size: ${spacing(4)};
      &:hover,
      &:focus {
        background: ${palette('common', 'white')};
      }
    }
  }
  .input-root {
    padding: 0;
    ${typography('body1')};
    &.input-underline:after {
      border-color: ${palette('primary', 'main')};
    }
  }
  .form-label-root {
    color: ${grey('600')};
    ${typography('caption2')};
    transform: scale(1);
    top: ${spacing(1)};
    z-index: 1;
    &.form-label-focus {
      color: ${palette('primary', 'main')};
    }
  }
` as React.ComponentType<JuiTextFieldProps>;

class JuiTextarea extends React.PureComponent<JuiTextFieldProps> {
  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onChange && this.props.onChange(e);
  }

  handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { onKeyDown } = this.props;
    if (e.key === 'ArrowUp') {
      e.preventDefault();
    }
    onKeyDown && onKeyDown(e);
  }

  InputProps = isOutlinedTextFieldProps(this.props)
    ? {
        classes: { root: 'input-root' },
      }
    : {
        classes: { root: 'input-root', underline: 'input-underline' },
      };

  render() {
    const { ...juiTextareaRest } = this.props;
    const { rows, ...textFieldRest } = juiTextareaRest;
    const { onChange, ...rest } = textFieldRest;
    return (
      <Textarea
        {...rest}
        multiline={true}
        onKeyDown={this.handleKeyDown}
        InputProps={this.InputProps}
        InputLabelProps={{
          FormLabelClasses: {
            root: 'form-label-root',
            focused: 'form-label-focus',
          },
          shrink: true,
        }}
        rows={rows || 3}
        onChange={this.handleChange}
      />
    );
  }
}

export { JuiTextarea };
