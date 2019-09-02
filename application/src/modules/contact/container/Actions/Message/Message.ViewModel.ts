/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-26 14:29:40
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { goToConversationWithLoading } from '@/common/goToConversation';
import { analyticsCollector } from '@/AnalyticsCollector';
// import { PHONE_ITEM_ACTIONS } from '@/AnalyticsCollector/constants';
import { MessageProps } from './types';

class MessageViewModel extends StoreViewModel<MessageProps> {
  goToConversation = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const { id, entity, contactType } = this.props;
    if (id) {
      analyticsCollector.contactActions(entity, 'message', contactType);
      analyticsCollector.goToConversation(entity);
      await goToConversationWithLoading({
        id,
      });
    }
  };
}

export { MessageViewModel };
