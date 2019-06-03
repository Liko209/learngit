/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-07 09:38:13
 * Copyright © RingCentral. All rights reserved.
 */
import styled from '../../../foundation/styled-components';
import { typography, grey, primary } from '../../../foundation/utils/styles';

const JuiEventLocation = styled.div`
  ${typography('body1')};
  color: ${grey('900')};
  a {
    color: ${primary('500')};
    &:hover {
      text-decoration: underline;
    }
  }
`;

export { JuiEventLocation };
