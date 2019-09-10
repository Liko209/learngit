/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-07-23 11:01:57
 * Copyright © RingCentral. All rights reserved.
 */

import { dataAnalysis } from 'foundation/analysis';

export function newConversation() {
  dataAnalysis.page('Jup_Web/DT_msg_newConversation');
}

type Action = 'createNewGroup' | 'convertToTeam' | 'cancel';
export function newConversationAction(action: Action) {
  dataAnalysis.track('Jup_Web/DT_msg_newConversationAction', {
    action,
  });
}
