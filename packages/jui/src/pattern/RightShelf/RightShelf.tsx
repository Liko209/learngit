/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-02 14:55:30
 * Copyright © RingCentral. All rights reserved.
 */

import styled from '../../foundation/styled-components';
import { palette, grey } from '../../foundation/utils';

const JuiRightShelf = styled('div')`
  -ms-overflow-style: -ms-autohiding-scrollbar;
  width: 100%;
  height: 100%;
  background-color: ${palette('common', 'white')};
  border-left: 1px solid ${grey('300')};
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

const JuiRightShelfContent = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  width: 100%;
`;

export { JuiRightShelf, JuiRightShelfContent };
