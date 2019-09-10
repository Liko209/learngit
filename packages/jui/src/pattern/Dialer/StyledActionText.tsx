/*
 * @Author: Spike.Yang
 * @Date: 2019-08-22 14:39:39
 * Copyright © RingCentral. All rights reserved.
 */

import styled from '../../foundation/styled-components';
import { spacing, typography, palette } from '../../foundation/utils/styles';

const StyledActionText = styled('p')`
  ${typography('caption')};
  color: ${palette('grey', '700')};
  text-align: center;
  margin: ${spacing(1, 0, 0)};
`;

StyledActionText.displayName = 'StyledActionText';

export { StyledActionText };
