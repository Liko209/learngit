/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2019-05-23 09:29:52
 * Copyright © RingCentral. All rights reserved.
 */
import MeetingItemModel from '@/store/models/MeetingItem';

type Props = {
  ids: number[];
};

type ViewProps = {
  meetingItem: MeetingItemModel;
  meetingTitle: string;
  duration: string;
};
enum MEETING_STATUS {
  NOT_STARTED = 'not_started',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
  LIVE = 'live',
  EXPIRED = 'expired',
  ENDED = 'ended',
}
enum MEETING_TITLE {
  VIDEO_CALL_ENDED = 'item.meeting.videoCallEnded',
  VIDEO_CALL_IN_PROGRESS = 'item.meeting.videoCallInProgress',
  START_VIDEO_CALL = 'item.meeting.startVideoCall',
  VIDEO_CALL_CANCELLED = 'item.meeting.videoCallCancelled',
}
export { Props, ViewProps, MEETING_STATUS, MEETING_TITLE };
