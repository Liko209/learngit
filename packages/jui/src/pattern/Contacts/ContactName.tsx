/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-27 10:55:48
 * Copyright © RingCentral. All rights reserved.
 */

import styled from '../../foundation/styled-components';
import { JuiListItemText } from '../../components/Lists';
import { ellipsis } from '../../foundation/utils';

const JuiContactNameWrapper = styled(JuiListItemText)`
  && {
    .list-item-primary {
      display: flex;
      align-items: center;
    }
  }
`;

const JuiContactName = styled.span`
  ${ellipsis()}
`;

export { JuiContactNameWrapper, JuiContactName };
