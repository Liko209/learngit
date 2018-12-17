/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-11 09:40:45
 * Copyright © RingCentral. All rights reserved.
 */

import styled from 'styled-components';
import { spacing } from 'jui/foundation/utils';

const Bottom: any = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  position: relative;
  height: calc(100% - ${spacing(16)}); // safari compatibility
`;

export default Bottom;
