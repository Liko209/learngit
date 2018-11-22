/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:13:56
 * Copyright © RingCentral. All rights reserved.
 */

import styled from '../../foundation/styled-components';
import { width } from '../../foundation/utils/styles';

const JuiProfileMiniCardHeader = styled('div')`
  display: flex;
  flex-direction: row;
`;

const JuiProfileMiniCardHeaderLeft = styled('div')`
  flex-basis: ${width(12.5)};
  flex-shrink: 0;
`;

const JuiProfileMiniCardHeaderMiddle = styled('div')`
  flex: 1;
  overflow: hidden;
`;

const JuiProfileMiniCardHeaderRight = styled('div')`
  display: inline-flex;
`;

JuiProfileMiniCardHeader.displayName = 'JuiProfileMiniCardHeader';

export {
  JuiProfileMiniCardHeader,
  JuiProfileMiniCardHeaderLeft,
  JuiProfileMiniCardHeaderMiddle,
  JuiProfileMiniCardHeaderRight,
};
