/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-07 15:45:04
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { Item } from 'sdk/module/item/entity';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { EventViewProps, EventProps } from './types';
import EventItemModel from '@/store/models/EventItem';
import { accentColor } from '@/common/AccentColor';

class EventViewModel extends StoreViewModel<EventProps>
  implements EventViewProps {
  @computed
  get _id() {
    return this.props.ids[0];
  }

  @computed
  get event() {
    return getEntity<Item, EventItemModel>(ENTITY_NAME.ITEM, this._id);
  }

  @computed
  get color() {
    return accentColor[this.event.color];
  }
}

export { EventViewModel };
