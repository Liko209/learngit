/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-13 10:29:27
 * Copyright © RingCentral. All rights reserved.
 */
import styled from 'styled-components';
import MuiInput from '@material-ui/core/Input';
import MuiInputLabel from '@material-ui/core/InputLabel';
import MuiFormHelperText from '@material-ui/core/FormHelperText';
import MuiFormControl from '@material-ui/core/FormControl';
import { palette } from '../../utils/styles';

const Input = styled(MuiInput)`
  &.underline {
    &:after {
      border-bottom-color: ${({ theme }) => palette('primary', 'main')};
    }
  }
`;

const InputLabel = styled(MuiInputLabel)``;

const FormHelperText = styled(MuiFormHelperText)``;

const FormControl = styled(MuiFormControl)``;

export { Input, InputLabel, FormHelperText, FormControl };
