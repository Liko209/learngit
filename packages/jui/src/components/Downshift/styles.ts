/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-06-28 13:28:20
 * Copyright © RingCentral. All rights reserved.
 */
import styled from '../../foundation/styled-components';
import { height } from '../../foundation/utils/styles';
import { JuiPaper } from '../Paper/Paper';
import { JuiTextField } from '../Forms/TextField';
import MuiTextField, { TextFieldProps } from '@material-ui/core/TextField';

const StyledPaper = styled(JuiPaper)`
  && {
    position: absolute;
    left: 0;
    bottom: 0;
    transform: translateY(100%);
    width: 100%;
    max-height: ${height(45)};
    z-index: ${({ theme }) => `${theme.zIndex.drawer}`};
    overflow: hidden;
  }
`;

const StyledTextField = styled<TextFieldProps>(JuiTextField)`
  && {
    .inputRoot {
      flex-wrap: wrap;
    }
    .input {
      flex: 1;
    }
    .downshift-label {
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
` as typeof MuiTextField;

const VL_STYLE = { padding: '8px 0' };

export { StyledPaper, StyledTextField, VL_STYLE };
