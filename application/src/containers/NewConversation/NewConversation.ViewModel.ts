/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-07-22 10:30:46
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, observable } from 'mobx';
import _ from 'lodash';
import { StoreViewModel } from '@/store/ViewModel';
import {
  goToConversation,
  getConversationId,
  ERROR_CONVERSATION_NOT_FOUND,
} from '@/common/goToConversation';
import { catchError } from '@/common/catchError';
import portalManager from '@/common/PortalManager';
import { newConversationAction } from './dataTrackings';

class NewConversationViewModel extends StoreViewModel {
  @observable
  members: (number | string)[] = [];
  @observable
  loading: boolean = false;

  @computed
  get disabledOkBtn() {
    return this.members.length === 0;
  }

  handleSearchContactChange = (items: any) => {
    this.members = items.map((item: any) => {
      if (item.id) {
        return item.id;
      }
      return item.email;
    });
  };

  handleClose = () => {
    portalManager.dismissLast();
  };

  @catchError.flash({
    network: 'people.prompt.newConversationNetworkError',
    server: 'people.prompt.newConversationBackendError',
  })
  createNewConversation = async () => {
    newConversationAction('Create new group');
    const ids = this.members.filter(id => _.isNumber(id)) as number[];
    try {
      this.loading = true;
      const conversationId = await getConversationId(Array.from(
        ids,
      ) as number[]);
      if (!conversationId) {
        throw new Error(ERROR_CONVERSATION_NOT_FOUND);
      }
      this.loading = false;
      this.handleClose();
      await goToConversation({
        conversationId,
      });
    } catch (error) {
      this.loading = false;
      throw error;
    }
  };
}

export { NewConversationViewModel };
