/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-10-24 18:16:50
 * Copyright © RingCentral. All rights reserved.
 */
import styled from '../../foundation/styled-components';
import { typography, grey, ellipsis, spacing } from '../../foundation/utils';

const JuiConversationPageHeaderSubtitle = styled.div`
  ${typography('subheading1')};
  color: ${grey('600')};
  display: flex;
  align-items: center;
  flex-grow: 1;
  flex-shrink: 1;
  overflow: hidden;
  > span {
    flex-shrink: 1;
    white-space: nowrap;
    ${ellipsis()};
    padding-right: ${spacing(4)};
  }
`;

export { JuiConversationPageHeaderSubtitle };
