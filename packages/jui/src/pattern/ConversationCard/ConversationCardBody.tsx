/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-11 14:26:52
 * Copyright © RingCentral. All rights reserved.
 */
import { spacing } from '../../foundation/utils';
import styled from '../../foundation/styled-components';

const JuiConversationCardBody = styled('div')`
  padding: ${spacing(0, 4, 4, 0)};
  font-size: 0;
  overflow: auto;

  .conversation-item-cards:last-child {
    margin-bottom: 0;
  }
`;

export { JuiConversationCardBody };
export default JuiConversationCardBody;
