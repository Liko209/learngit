/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-04-08 10:27:50
 * Copyright © RingCentral. All rights reserved.
 */

import styled from '../../../foundation/styled-components';
import { spacing, height } from '../../../foundation/utils/styles';

const JuiFullSearch = styled.div`
  padding: ${spacing(2, 0, 0)};
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: calc(100% - ${height(12)});
`;

export { JuiFullSearch };
