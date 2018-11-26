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
import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { service } from 'sdk';
import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';
import { Props, ViewProps } from './types';

const { GroupService } = service;

class JumpToConversationViewModel extends StoreViewModel<Props>
  implements ViewProps {
  private _groupService: service.GroupService = GroupService.getInstance();

  @computed
  get id() {
    return this.props.id;
  }

  @computed
  get children() {
    return this.props.children;
  }

  getConversationId = async (id: number) => {
    const type = GlipTypeUtil.extractTypeId(id);
    if (
      type === TypeDictionary.TYPE_ID_GROUP ||
      type === TypeDictionary.TYPE_ID_TEAM
    ) {
      return id;
    }
    if (type === TypeDictionary.TYPE_ID_PERSON) {
      const group = await this._groupService.getGroupByMemberList([id]);
      if (group) {
        return group.id;
      }
      return 0;
    }
    return 0;
  }
}

export { JumpToConversationViewModel };
