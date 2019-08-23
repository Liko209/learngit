/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2019-05-23 09:29:52
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { ENTITY_NAME } from '@/store';
import { getEntity, getGlobalValue } from '@/store/utils';
import { StoreViewModel } from '@/store/ViewModel';
import { Props, ViewProps, MEETING_TITLE } from './types';
import { MEETING_STATUS } from '@/store/models/MeetingsUtils';
import { Item } from 'sdk/module/item/module/base/entity';
import MeetingItemModel from '@/store/models/MeetingItem';
import { formatDuration } from '@/utils/date/';
import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';
import RCVideoMeetingItemModel from '@/store/models/RCVideoMeetingItem';
import { MeetingsService } from 'sdk/module/meetings';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
// import { ElectronService } from '@/modules/electron';
// import { container } from 'framework/ioc';
import { GLOBAL_KEYS } from '@/store/constants';
import { MEETING_ACTION } from 'sdk/module/meetings/types';
import { mainLogger } from 'foundation/log';

class MeetingViewModel extends StoreViewModel<Props> implements ViewProps {
  // private get _electronService() {
  //   return container.get(ElectronService);
  // }

  @computed
  get meetingStrategy(): {
    [x: number]:
      | (() => {
          meeting: MeetingItemModel;
          meetingId: number;
        })
      | (() => {
          meeting: RCVideoMeetingItemModel;
          meetingId: number;
        });
  } {
    return {
      [TypeDictionary.TYPE_ID_MEETING]: () => {
        const meeting = getEntity<Item, MeetingItemModel>(
          ENTITY_NAME.ITEM,
          this.props.ids[0],
        );
        return {
          meeting,
          meetingId: meeting.zoomMeetingId,
        };
      },
      [TypeDictionary.TYPE_ID_RC_VIDEO]: () => {
        const meeting = getEntity<Item, RCVideoMeetingItemModel>(
          ENTITY_NAME.ITEM,
          this.props.ids[0],
        );
        return {
          meeting,
          meetingId: Number(meeting.meetingId),
        };
      },
    };
  }
  @computed
  get meetingType() {
    return GlipTypeUtil.extractTypeId(this.props.ids[0]);
  }
  @computed
  get meetingDTO() {
    return this.meetingStrategy[this.meetingType]();
  }
  @computed
  get meetingItem() {
    return this.meetingDTO.meeting;
  }
  @computed
  get meetingId() {
    return this.meetingDTO.meetingId;
  }

  getDialInNumber = () => {
    const a = ServiceLoader.getInstance<MeetingsService>(
      ServiceConfig.MEETINGS_SERVICE,
    ).getDialInNumber(this.meetingType === TypeDictionary.TYPE_ID_RC_VIDEO);
    return a;
  };

  joinMeeting = () => {
    // this._electronService.openWindow({ url: this.joinUrl });
  };

  callbackMeeting = async () => {
    const id = getGlobalValue(GLOBAL_KEYS.CURRENT_CONVERSATION_ID);
    const result = await ServiceLoader.getInstance<MeetingsService>(
      ServiceConfig.MEETINGS_SERVICE,
    ).startMeeting([id]);
    if (result.action === MEETING_ACTION.DEEP_LINK) {
      window.open(result.link);
    } else {
      // show alert
      mainLogger.info(result.reason || 'start video error');
    }
  };

  cancelMeeting = () => {};

  @computed
  get meetingTitle() {
    const status = this.meetingItem.meetingStatus;
    const statusMap = {
      [MEETING_STATUS.ENDED]: MEETING_TITLE.VIDEO_CALL_ENDED,
      [MEETING_STATUS.CANCELLED]: MEETING_TITLE.VIDEO_CALL_CANCELLED,
      [MEETING_STATUS.NOT_STARTED]: MEETING_TITLE.START_VIDEO_CALL,
      [MEETING_STATUS.EXPIRED]: MEETING_TITLE.VIDEO_CALL_ENDED,
      [MEETING_STATUS.LIVE]: MEETING_TITLE.VIDEO_CALL_IN_PROGRESS,
      [MEETING_STATUS.NO_ANSWER]: 'No Answer for This Video Call', // need to confirm with UX for translation
    };
    if (statusMap[status]) {
      return statusMap[status];
    }
    return '';
  }
  @computed
  get joinUrl() {
    return this.meetingItem.joinUrl;
  }
  @computed
  get duration() {
    const { duration } = this.meetingItem;
    return formatDuration(duration);
  }
}

export { MeetingViewModel };
