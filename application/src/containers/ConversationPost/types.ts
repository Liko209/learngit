import { JuiConversationCard } from 'jui/src/pattern/ConversationCard';
import { RefObject } from 'react';

/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:28:57
 * Copyright © RingCentral. All rights reserved.
 */

enum POST_TYPE {
  NOTIFICATION = 1,
  POST,
}

type ConversationPostProps = {
  cardRef?: RefObject<JuiConversationCard>;
  id: number;
};

type ConversationPostViewProps = {
  id: number;
  type: POST_TYPE;
  cardRef?: RefObject<JuiConversationCard>;
};

export { ConversationPostProps, ConversationPostViewProps, POST_TYPE };
