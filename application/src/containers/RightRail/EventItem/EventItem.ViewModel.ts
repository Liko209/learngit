/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-16 15:01:30
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import { Item } from 'sdk/module/item/entity';
import EventItemModel from '@/store/models/EventItem';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import { dateFormatter } from '@/utils/date';
import moment from 'moment';
import { Props, ViewProps } from './types';
class EventItemViewModel extends AbstractViewModel<Props> implements ViewProps {
  @computed
  get _id() {
    return this.props.id;
  }

  @computed
  get event() {
    return getEntity<Item, EventItemModel>(ENTITY_NAME.EVENT_ITEM, this._id);
  }

  @computed
  get text() {
    return this.event.text;
  }

  @computed
  get createdTime() {
    const { start } = this.event;
    return dateFormatter.dateAndTimeWithoutWeekday(moment(start));
  }
}

export { EventItemViewModel };
