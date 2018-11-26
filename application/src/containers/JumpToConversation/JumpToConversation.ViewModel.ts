/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-26 17:32:24
 * Copyright © RingCentral. All rights reserved.
 */
/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-26 15:23:26
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, observable } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { service } from 'sdk';
import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';
import { Props, ViewProps } from './types';

const { GroupService } = service;

class JumpToConversationViewModel extends StoreViewModel<Props>
  implements ViewProps {
  @observable
  conversationId: number;
  private _groupService: service.GroupService = GroupService.getInstance();

  @computed
  private get _id() {
    return this.props.id;
  }

  getConversationId = async () => {
    const type = GlipTypeUtil.extractTypeId(this._id);
    if (
      type === TypeDictionary.TYPE_ID_GROUP ||
      type === TypeDictionary.TYPE_ID_TEAM
    ) {
      this.conversationId = this._id;
      return;
    }
    if (type === TypeDictionary.TYPE_ID_PERSON) {
      const group = await this._groupService.getOrCreateGroupByMemberList([this._id]);
      if (group) {
        this.conversationId = group.id;
      } else {
        this.conversationId = 0;
      }
    }
  }
}

export { JumpToConversationViewModel };
