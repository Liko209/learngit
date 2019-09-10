/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2019-05-07 15:06:10
 * Copyright © RingCentral. All rights reserved.
 */
import styled from '../../foundation/styled-components';
import { palette } from '../../foundation/utils/styles';

const JuiConversationNumberLink = styled.a`
  color: ${palette('primary', 'main')};
  &:hover {
    text-decoration: underline;
  }
`;
export { JuiConversationNumberLink };
