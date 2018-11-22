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
  width,
} from '../../foundation/utils/styles';

const JuiProfileMiniCardPersonName = styled('div')`
  ${typography('subheading2')};
  ${ellipsis()};
  color: ${grey('900')};
  height: ${height(5.5)};
  width: ${width(45)};
`;

JuiProfileMiniCardPersonName.displayName = 'JuiProfileMiniCardPersonName';

export { JuiProfileMiniCardPersonName };
