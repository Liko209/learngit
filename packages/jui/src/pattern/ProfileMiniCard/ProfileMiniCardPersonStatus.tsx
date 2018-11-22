/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:13:56
 * Copyright © RingCentral. All rights reserved.
 */

import styled from '../../foundation/styled-components';
import {
  typography,
  ellipsis,
  grey,
  width,
} from '../../foundation/utils/styles';

const JuiProfileMiniCardPersonStatus = styled('div')`
  ${typography('body2')};
  ${ellipsis()};
  color: ${grey('500')};
  width: ${width(45)};
`;

JuiProfileMiniCardPersonStatus.displayName = 'JuiProfileMiniCardPersonStatus';

export { JuiProfileMiniCardPersonStatus };
