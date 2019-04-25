/*
 * @Author: Steven Zhuang (steven.zhuang@ringcentral.com)
 * @Date: 2019-01-15 13:34:08
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { ENTITY_NAME } from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';
import { getEntity, getGlobalValue } from '@/store/utils';
import { StoreViewModel } from '@/store/ViewModel';
import { Props, ViewProps } from './types';
import ConferenceItemModel from '@/store/models/ConferenceItem';
import { Item } from 'sdk/module/item/entity';

// TO-DO: This definition need to be moved to brand config once Brand is supported.
const GLOBAL_NUMBER_RC = 'https://ringcentr.al/2L14jqL';

class ConferenceViewModel extends StoreViewModel<Props> implements ViewProps {
  @computed
  private get _id() {
    return this.props.ids[0];
  }

  @computed
  get conference() {
    return getEntity<Item, ConferenceItemModel>(ENTITY_NAME.ITEM, this._id);
  }

  @computed
  get isHostByMe() {
    const currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
    return !!(
      currentUserId &&
      this.conference.creatorId &&
      currentUserId === this.conference.creatorId
    );
  }

  @computed
  get globalNumber() {
    return GLOBAL_NUMBER_RC;
  }
}

export { ConferenceViewModel };
