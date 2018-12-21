/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-07 15:45:04
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { Item } from 'sdk/models';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { EventViewProps, EventProps } from './types';
import EventItemModal from '@/store/models/EventItem';

class EventViewModel extends StoreViewModel<EventProps>
  implements EventViewProps {
  @computed
  get _id() {
    return this.props.ids[0];
  }

  @computed
  get event() {
    return getEntity<Item, EventItemModal>(ENTITY_NAME.EVENT_ITEM, this._id);
  }
}

export { EventViewModel };
