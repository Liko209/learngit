/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-02-28 10:04:08
 * Copyright © RingCentral. All rights reserved.
 */
import styled from '../../../foundation/styled-components';
import { typography, grey, primary } from '../../../foundation/utils/styles';

const JuiTaskSectionOrDescription = styled.div`
  ${typography('body1')};
  color: ${grey('500')};
  a {
    color: ${primary('500')};
    &:hover {
      text-decoration: underline;
    }
  }
`;

export { JuiTaskSectionOrDescription };
