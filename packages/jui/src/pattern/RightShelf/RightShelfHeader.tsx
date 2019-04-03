/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-02 14:55:30
 * Copyright © RingCentral. All rights reserved.
 */

import styled from '../../foundation/styled-components';
import {
  palette,
  spacing,
  height,
  grey,
  typography,
  ellipsis,
} from '../../foundation/utils';

const JuiRightShelfHeader = styled('div')`
  ${typography('subheading1')}
  height: ${height(12)};
  flex-basis: ${height(12)};
  flex-shrink: 0;
  background-color: ${palette('common', 'white')};
  padding: ${spacing(0, 2)};
  color: ${grey('900')};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const JuiRightShelfHeaderText = styled('div')`
  flex: 1;
  max-width: 80%;
  ${ellipsis()}
`;
const JuiRightShelfHeaderIcon = styled('div')`
  /* position: absolute;
  top: ${spacing(1)};
  right: 0; */
  /* ConversationHeader z-index is appBar */
  /* RightShelf fixed z-index is appBar + 1 */
  /* z-index: ${({ theme }) => theme.zIndex.appBar + 2}; */
`;

export {
  JuiRightShelfHeader,
  JuiRightShelfHeaderText,
  JuiRightShelfHeaderIcon,
};
