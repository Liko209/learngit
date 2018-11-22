/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:13:56
 * Copyright © RingCentral. All rights reserved.
 */

import styled from '../../foundation/styled-components';
import { width } from '../../foundation/utils/styles';

const JuiProfileMiniCardPersonHeader = styled('div')`
  display: flex;
  flex-direction: row;
`;

const JuiProfileMiniCardPersonHeaderLeft = styled('div')`
  flex-basis: ${width(12.5)};
  flex-shrink: 0;
`;

const JuiProfileMiniCardPersonHeaderMiddle = styled('div')`
  flex: 1;
`;

const JuiProfileMiniCardPersonHeaderRight = styled('div')`
  display: inline-flex;
`;

JuiProfileMiniCardPersonHeader.displayName = 'JuiProfileMiniCardPersonHeader';

export {
  JuiProfileMiniCardPersonHeader,
  JuiProfileMiniCardPersonHeaderLeft,
  JuiProfileMiniCardPersonHeaderMiddle,
  JuiProfileMiniCardPersonHeaderRight,
};
