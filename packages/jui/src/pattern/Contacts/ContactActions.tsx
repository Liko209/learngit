/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-27 10:55:48
 * Copyright © RingCentral. All rights reserved.
 */

import styled from '../../foundation/styled-components';
import { JuiButtonBar } from '../../components/Buttons';
import { spacing } from '../../foundation/utils';

const JuiContactActions = styled(JuiButtonBar)`
  && {
    margin: ${spacing(0, 0, 0, 10)};
  }
`;

export { JuiContactActions };
