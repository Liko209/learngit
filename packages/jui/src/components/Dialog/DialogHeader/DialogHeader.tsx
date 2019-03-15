/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-03-01 13:19:14
 * Copyright © RingCentral. All rights reserved.
 */
import styled from '../../../foundation/styled-components';
import { spacing, height } from '../../../foundation/utils/styles';

const JuiDialogHeader = styled.div`
  background-color: white;
  padding: ${spacing(0, 6)};
  height: ${height(13)};
  display: flex;
  align-items: center;
`;

export { JuiDialogHeader };
