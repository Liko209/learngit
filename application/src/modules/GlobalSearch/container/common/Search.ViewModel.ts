/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-02 19:43:46
 * Copyright © RingCentral. All rights reserved.
 */
import { action } from 'mobx';
import { container } from 'framework/ioc';
import { StoreViewModel } from '@/store/ViewModel';
import { goToConversationWithLoading } from '@/common/goToConversation';
import { joinPublicTeam } from '@/common/joinPublicTeam';
import GroupModel from '@/store/models/Group';

import { GlobalSearchService } from '../../service';
import { GlobalSearchStore } from '../../store';

class SearchViewModel<T> extends StoreViewModel<T> {
  @action
  handleJoinTeam = (item: GroupModel) => {
    this.onClear();
    this.onClose();
    joinPublicTeam(item);
  }

  @action
  goToConversation = async (id: number) => {
    this.onClear();
    this.onClose();
    await goToConversationWithLoading({ id });
  }

  @action
  onClear = () => {
    container.get(GlobalSearchStore).clearSearchKey();
  }

  @action
  onClose = () => {
    container.get(GlobalSearchService).closeGlobalSearch();
  }
}

export { SearchViewModel };
