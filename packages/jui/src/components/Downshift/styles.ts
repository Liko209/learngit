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
    display: flex;
    flex-direction: column;
  }
`;

const StyledTextField = styled<TextFieldProps>(JuiTextField)`
  && {
    .inputRoot {
      flex-wrap: wrap;
    }
    .input {
      flex-grow: 1;
      width: 0;
    }
    .downshift-label {
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .multiple {
      flex-grow: 1;
      width: auto;
    }
  }
` as typeof MuiTextField;

// TODO
// There is some problem to deal with the padding of VL,
// Need to support support it later and restore the 8px
// padding top and 8px padding bottom here
const VL_STYLE = { padding: '0' };

export { StyledPaper, StyledTextField, VL_STYLE };
