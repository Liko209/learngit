/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:13:56
 * Copyright © RingCentral. All rights reserved.
 */

import styled from '../../foundation/styled-components';
import { height, spacing, grey } from '../../foundation/utils';

const JuiMiniCardFooter = styled('div')`
  height: ${height(13)};
  display: flex;
  align-items: center;
  padding: ${spacing(0, 4, 0, 2)};
  border-top: 1px solid ${grey('300')};
`;

JuiMiniCardFooter.displayName = 'JuiMiniCardFooter';

export { JuiMiniCardFooter };
