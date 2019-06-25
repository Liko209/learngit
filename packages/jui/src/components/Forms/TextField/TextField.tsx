/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-17 15:03:14
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../../foundation/styled-components';
import MuiTextField, { TextFieldProps } from '@material-ui/core/TextField';
import {
  spacing,
  palette,
  grey,
  typography,
} from '../../../foundation/utils/styles';
import isOutlinedTextFieldProps from '../isOutlinedTextFieldProps';

const TextField = styled(MuiTextField)`
  && {
    margin: 0 0 ${spacing(4)} 0;
    label {
      color: ${grey('600')};
      ${typography('caption2')};
      transform: scale(1);
    }
    input {
      ::placeholder {
        color: ${grey('600')};
        ${typography('body1')};
      }
    }
  }
  && {
    .form-label-focused:not(.form-label-error) {
      color: ${palette('primary', 'main')};
    }
  }

  .underline {
    &:after {
      border-bottom-color: ${palette('primary', 'main')};
    }
  }
` as typeof MuiTextField;

type Props = TextFieldProps & {
  avoidArrowUpKeydown?: boolean;
};

class JuiTextField extends React.PureComponent<Props> {
  onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { onKeyDown, avoidArrowUpKeydown = true, type } = this.props;
    if (e.key === 'ArrowUp' && avoidArrowUpKeydown && type !== 'number') {
      // https://jira.ringcentral.com/browse/FIJI-1941
      e.preventDefault();
    }
    onKeyDown && onKeyDown(e);
  }

  render() {
    const { innerRef, ...textFieldRest } = this.props;
    const { InputLabelProps, InputProps, ...rest } = textFieldRest;
    let inputPropsClasses;
    let inputPropsRest;
    let formLabelClasses;
    let inputLabelRest;
    if (InputProps) {
      const { classes, ...InputPropsRest } = InputProps;
      inputPropsClasses = classes;
      inputPropsRest = InputPropsRest;
    }
    if (InputLabelProps) {
      const { FormLabelClasses, ...InputLabelPropsRest } = InputLabelProps;
      formLabelClasses = FormLabelClasses;
      inputLabelRest = InputLabelPropsRest;
    }
    return (
      <TextField
        {...rest}
        onKeyDown={this.onKeyDown}
        InputLabelProps={{
          FormLabelClasses: {
            error: 'form-label-error',
            focused: 'form-label-focused',
            ...formLabelClasses,
          },
          shrink: true,
          ...inputLabelRest,
        }}
        InputProps={{
          classes: isOutlinedTextFieldProps(this.props)
            ? inputPropsClasses
            : {
                underline: 'underline',
                ...inputPropsClasses,
              },
          ...inputPropsRest,
        }}
      />
    );
  }
}

export { JuiTextField };
