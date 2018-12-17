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
  height,
} from '../../foundation/utils/styles';

const JuiProfileMiniCardPersonName = styled('div')`
  ${typography('subheading2')};
  ${ellipsis()};
  height: ${height(5.5)};
  color: ${grey('900')};
`;

JuiProfileMiniCardPersonName.displayName = 'JuiProfileMiniCardPersonName';

export { JuiProfileMiniCardPersonName };
