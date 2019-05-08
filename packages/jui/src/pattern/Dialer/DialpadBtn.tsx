/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-05-02 17:23:23
 * Copyright © RingCentral. All rights reserved.
 */

import { JuiFabButton } from '../../components/Buttons';
import styled from '../../foundation/styled-components';
import { spacing } from '../../foundation/utils';

const JuiDialpadBtn = styled(JuiFabButton)`
  && {
    margin-right: ${spacing(3)};
  }
`;

export { JuiDialpadBtn };
