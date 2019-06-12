/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:28:57
 * Copyright © RingCentral. All rights reserved.
 */
import { POST_TYPE } from '../../../../common/getPostType';
import { JuiConversationCard } from 'jui/pattern/ConversationCard';
import { RefObject } from 'react';

type ConversationPostProps = {
  cardRef?: RefObject<JuiConversationCard>;
  id: number;
  mode?: 'navigation';
};

type ConversationPostViewProps = ConversationPostProps & {
  type: POST_TYPE;
  conversationId: number;
};

export { ConversationPostProps, ConversationPostViewProps };
