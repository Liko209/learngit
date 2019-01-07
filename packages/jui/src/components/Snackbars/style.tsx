/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-11-22 15:45:22
 * Copyright © RingCentral. All rights reserved.
 */
import MuiButtonBase from '@material-ui/core/ButtonBase';

import styled from '../../foundation/styled-components';
import {
  typography,
  height,
  activeOpacity,
  disabledOpacity,
} from '../../foundation/utils/styles';

const StyledTextButton = styled(MuiButtonBase)`
  ${typography('body2')}
  line-height: ${height(4)};

  &:hover {
    text-decoration: underline;
  }

  &:active {
    ${activeOpacity()}
  }

  &:disabled {
    ${disabledOpacity()}
  }
`;

const StyledIconButton = styled(MuiButtonBase)`
  font-size: ${height(4)};

  &:active {
    ${activeOpacity()}
  }

  &:disabled {
    ${disabledOpacity()}
  }
`;

export { StyledTextButton, StyledIconButton };
