/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-26 14:29:40
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { goToConversationWithLoading } from '@/common/goToConversation';
import { analyticsCollector } from '@/AnalyticsCollector';
import { PHONE_ITEM_ACTIONS } from '@/AnalyticsCollector/constants';
import { MessageProps, ENTITY_TYPE } from './types';

class MessageViewModel extends StoreViewModel<MessageProps> {
  goToConversation = async () => {
    const person = this.props.person;
    const tabName = this.props.tabName;
    if (person) {
      analyticsCollector.phoneActions(tabName, PHONE_ITEM_ACTIONS.MESSAGE);
      analyticsCollector.goToConversation(
        this.props.entity === ENTITY_TYPE.CALL_LOG
          ? 'callHistory'
          : 'voicemailList',
      );
      await goToConversationWithLoading({
        id: person.id,
      });
    }
  };
}

export { MessageViewModel };
