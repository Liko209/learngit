/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-02 14:55:30
 * Copyright © RingCentral. All rights reserved.
 */

import styled from '../../foundation/styled-components';
import { palette, grey } from '../../foundation/utils';

const JuiRightShelf = styled('div')`
  width: 100%;
  height: 100%;
  background-color: ${palette('common', 'white')};
  border-left: 1px solid ${grey('300')};
`;

export { JuiRightShelf };
