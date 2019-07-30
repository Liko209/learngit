/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-07-23 11:01:57
 * Copyright © RingCentral. All rights reserved.
 */

import { dataAnalysis } from 'sdk';

export function newConversation() {
  dataAnalysis.page('Jup_Web/DT_conversation_newConversation');
}

type Action = 'Create new group' | 'Convert to team' | 'Cancel';
export function newConversationAction(action: Action) {
  dataAnalysis.track('Jup_Web/DT_conversation_newConversationAction', {
    action,
  });
}
