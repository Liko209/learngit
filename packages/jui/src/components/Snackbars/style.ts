/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-16 10:46:08
 * Copyright © RingCentral. All rights reserved.
 */
import MuiSnackbarContent from '@material-ui/core/SnackbarContent';

import styled from '../../foundation/styled-components';
import { spacing, background } from '../../foundation/utils/styles';

const SnackbarContent = styled(MuiSnackbarContent)`
  && {
    padding: ${spacing(2, 6)};
    background: ${background('semantic', 'negative')};
    box-shadow: none;
  }
  .message {
    padding: 0;
  }
`;

const MessageWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export { SnackbarContent, MessageWrapper };
