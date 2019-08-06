/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-03-13 15:24:20
 * Copyright © RingCentral. All rights reserved.
 */

import styled from '../../foundation/styled-components';
import { spacing, grey, typography } from '../../foundation/utils/styles';

const StyledText = styled('div')`
  ${typography('body1')};
  * {
    ${typography('body1')};
  }
`;

const JuiTopText = styled(StyledText)`
  color: ${grey('700')};
  padding-bottom: ${spacing(4)};
`;

const JuiBottomText = styled(StyledText)`
  color: ${grey('700')};
  padding-top: ${spacing(4)};
`;

export { JuiTopText, JuiBottomText };
