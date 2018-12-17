/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:13:56
 * Copyright © RingCentral. All rights reserved.
 */

import styled from '../../foundation/styled-components';
import { typography, grey, height } from '../../foundation/utils/styles';

const JuiProfileMiniCardGroupName = styled('div')`
  ${typography('subheading2')};
  color: ${grey('900')};
  height: ${height(11)};
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-all;
`;

JuiProfileMiniCardGroupName.displayName = 'JuiProfileMiniCardGroupName';

export { JuiProfileMiniCardGroupName };
