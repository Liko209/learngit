/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-03-01 14:08:05
 * Copyright © RingCentral. All rights reserved.
 */
import styled from '../../../foundation/styled-components';
import { spacing } from '../../../foundation/utils/styles';

const JuiDialogHeaderActions = styled.div`
  margin: ${spacing(-2.5, -2.5, -2.5, 4)};
  display: flex;
  align-items: center;
  justify-content: flex-end;
  && > * {
    margin-left: -${spacing(2.5)};
    &:first-child {
      margin-left: 0;
    }
  }
`;

export { JuiDialogHeaderActions };
