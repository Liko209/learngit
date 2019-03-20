/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-29 17:29:58
 * Copyright © RingCentral. All rights reserved.
 */

import styled from '../../foundation/styled-components';
import { spacing } from '../../foundation/utils';
import { JuiPopoverMenu } from '../PopoverMenu';

const JuiNewActions = styled(JuiPopoverMenu)`
  margin-right: ${spacing(5)};
`;

JuiNewActions.displayName = 'JuiNewActions';

export { JuiNewActions };
