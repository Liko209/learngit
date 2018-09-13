/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-13 10:29:27
 * Copyright © RingCentral. All rights reserved.
 */
import styled from 'styled-components';
import MuiInput from '@material-ui/core/Input';
import { palette } from '../../utils/styles';

const Input = styled(MuiInput)`
  &.underline {
    &:after {
      border-bottom-color: ${({ theme }) => palette('primary', 'main')};
    }
  }
`;

export { Input };
