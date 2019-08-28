/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:13:56
 * Copyright © RingCentral. All rights reserved.
 */

import styled from '../../../foundation/styled-components';
import { typography, ellipsis, grey } from '../../../foundation/utils/styles';

const JuiProfileMiniCardPersonStatus = styled('div')`
  ${typography('body1')};
  ${ellipsis()};
  color: ${grey('500')};
  && {
    .emoji-mart-emoji {
      position: relative;
      top: 50%;
      transform: translateY(10%);
    }
  }
`;

JuiProfileMiniCardPersonStatus.displayName = 'JuiProfileMiniCardPersonStatus';

export { JuiProfileMiniCardPersonStatus };
