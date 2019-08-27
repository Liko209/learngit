/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-08-26 23:55:59
 * Copyright © RingCentral. All rights reserved.
 */

import GroupModel from '@/store/models/Group';
import { CONVERSATION_TYPES } from '@/constants';
import { GroupSearchItem } from '@/containers/Downshift/GroupSearch/GroupSearchItem';
import { ContactSearchItem } from '@/containers/Downshift/ContactSearch/ContactSearchItem';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import _ from 'lodash';

export function mapGroupModelToItem(groupModel: GroupModel) {
  const members = groupModel.members;

  switch (groupModel.type) {
    case CONVERSATION_TYPES.TEAM:
    case CONVERSATION_TYPES.NORMAL_GROUP:
      return {
        Item: GroupSearchItem,
        props: { itemId: groupModel.id, size: 'large' },
      };
    case CONVERSATION_TYPES.ME:
      return {
        Item: ContactSearchItem,
        props: { itemId: members[0], showEmail: false, size: 'large' },
      };
    default: {
      const currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
      const otherId = _.difference(members, [currentUserId])[0];
      return {
        Item: ContactSearchItem,
        props: { itemId: otherId, showEmail: false, size: 'large' },
      };
    }
  }
}
