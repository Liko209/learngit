/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-07-30 01:26:14
 * Copyright © RingCentral. All rights reserved.
 */

import styled from '../../foundation/styled-components';
import { JuiDialogHeader, JuiDialogTitle } from '../../components/Dialog';

const StyledJuiDialogTitle = styled(JuiDialogTitle)`
  && {
    padding: 0;
  }
`;

const StyledDialogHeader = styled(JuiDialogHeader)`
  justify-content: space-between;
`;

export { StyledDialogHeader, StyledJuiDialogTitle };
