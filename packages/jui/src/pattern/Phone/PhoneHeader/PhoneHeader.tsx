/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-05-28 13:47:48
 * Copyright © RingCentral. All rights reserved.
 */
import { spacing } from '../../../foundation/utils';
import { JuiConversationPageHeader } from '../../../pattern/ConversationPageHeader';
import styled from '../../../foundation/styled-components';

const PhoneHeader = styled(JuiConversationPageHeader)`
  margin: ${spacing(0, 0, 2)};
`;

export { PhoneHeader };
