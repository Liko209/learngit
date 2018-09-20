/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-17 15:03:14
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from 'styled-components';
import MuiTextField, { TextFieldProps } from '@material-ui/core/TextField';
import { spacing, palette } from '../../utils/styles';

const TextField = styled(MuiTextField)`
  && {
    margin: 0 0 ${({ theme }) => spacing(2)} 0;
  }
  && {
    .form-label-focused:not(.form-label-error) {
      color: ${({ theme }) => palette('primary', 'main')};
    }
  }

  .underline {
    &:after {
      border-bottom-color: ${({ theme }) => palette('primary', 'main')};
    }
  }
`;

type IProps = TextFieldProps;

const JuiTextField = (props: IProps) => {
  const { innerRef, ...textFieldRest } = props;
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
      InputLabelProps={{
        FormLabelClasses: {
          error: 'form-label-error',
          focused: 'form-label-focused',
          ...formLabelClasses,
        },
        ...inputLabelRest,
      }}
      InputProps={{
        classes: {
          underline: 'underline',
          ...inputPropsClasses,
        },
        ...inputPropsRest,
      }}
    />
  );
};

export default JuiTextField;
