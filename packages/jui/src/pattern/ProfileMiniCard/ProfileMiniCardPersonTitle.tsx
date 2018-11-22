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

const JuiProfileMiniCardPersonTitle = styled('div')`
  ${typography('caption1')};
  ${ellipsis()};
  color: ${grey('500')};
  width: ${width(45)};
`;

JuiProfileMiniCardPersonTitle.displayName = 'JuiProfileMiniCardPersonTitle';

export { JuiProfileMiniCardPersonTitle };
