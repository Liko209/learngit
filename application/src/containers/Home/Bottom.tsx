/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-11 09:40:45
 * Copyright © RingCentral. All rights reserved.
 */

import styled from 'styled-components';

const Bottom: any = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  height: calc(100% - 65px); // safari compatibility
`;

export default Bottom;
