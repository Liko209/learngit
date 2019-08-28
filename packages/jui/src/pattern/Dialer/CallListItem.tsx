/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-08-21 11:21:16
 * Copyright © RingCentral. All rights reserved.
 */
import { JuiListItem } from '../../components/Lists';
import styled from '../../foundation/styled-components';
import { spacing } from '../../foundation/utils/styles';

const JuiCallListItem = styled(JuiListItem)`
  && {
    justify-content: space-between;
    padding: ${spacing(2, 4)};
    cursor: pointer;
  }
`;

export { JuiCallListItem };
