/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2019-05-23 09:29:52
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import { StoreViewModel } from '@/store/ViewModel';
import { Props, ViewProps, MEETING_STATUS, MEETING_TITLE } from './types';
import { Item } from 'sdk/module/item/module/base/entity';
import MeetingItemModel from '@/store/models/MeetingItem';
import { formatDuration } from '@/utils/date/';

class MeetingViewModel extends StoreViewModel<Props> implements ViewProps {
  @computed
  get meetingItem() {
    return getEntity<Item, MeetingItemModel>(
      ENTITY_NAME.ITEM,
      this.props.ids[0],
    );
  }
  @computed
  get meetingTitle() {
    const { status } = this.meetingItem;
    const statusMap = {
      [MEETING_STATUS.ENDED]: MEETING_TITLE.VIDEO_CALL_ENDED,
      [MEETING_STATUS.CANCELLED]:  MEETING_TITLE.VIDEO_CALL_CANCELLED,
      [MEETING_STATUS.NOT_STARTED]: MEETING_TITLE.START_VIDEO_CALL,
      [MEETING_STATUS.EXPIRED]: MEETING_TITLE.VIDEO_CALL_ENDED,
      [MEETING_STATUS.LIVE]: MEETING_TITLE.VIDEO_CALL_IN_PROGRESS,
    };
    if (statusMap[status]) {
      return statusMap[status];
    }
    return '';
  }
  @computed
  get duration() {
    const { duration } = this.meetingItem;
    return formatDuration(duration);
  }
}

export { MeetingViewModel };
