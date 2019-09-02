/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-27 10:55:48
 * Copyright © RingCentral. All rights reserved.
 */

import styled from '../../foundation/styled-components';
import { JuiListItemText } from '../../components/Lists';
import { typography } from '../../foundation/utils';

const JuiContactName = styled(JuiListItemText)`
  && {
    .list-item-primary {
      display: flex;
      align-items: center;
      ${typography('subheading3')}
    }
  }
`;

export { JuiContactName };
