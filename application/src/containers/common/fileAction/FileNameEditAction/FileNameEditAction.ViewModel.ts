/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-30 09:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import { Group } from 'sdk/module/group/entity';
import GroupModel from '@/store/models/Group';
import { computed } from 'mobx';
import { getGlobalValue, getEntity } from '@/store/utils';
import { GLOBAL_KEYS, ENTITY_NAME } from '@/store/constants';
import { FileActionViewModel } from '../common/FIleAction.ViewModel';

class FileNameEditActionViewModel extends FileActionViewModel {
  @computed
  get canEditFileName() {
    const { creatorId } = this.item;
    const groupId = getGlobalValue(GLOBAL_KEYS.CURRENT_CONVERSATION_ID);
    const personId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
    const group = getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, groupId);
    return !(group.isThePersonGuest(personId) && personId !== creatorId);
  }
}

export { FileNameEditActionViewModel };
