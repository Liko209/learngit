/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2019-05-23 09:29:52
 * Copyright © RingCentral. All rights reserved.
 */
import MeetingItemModel from '@/store/models/MeetingItem';
import RCVideoMeetingItem from '@/store/models/RCVideoMeetingItem';

type Props = {
  ids: number[];
};

type ViewProps = {
  meetingItem: MeetingItemModel | RCVideoMeetingItem;
  meetingTitle: string;
  duration: string;
  meetingId: number;
  getDialInNumber(): string;
  callbackMeeting: () => void;
  joinMeeting: () => void;
  cancelMeeting: () => void;
  isMeetingOwner: boolean;
};

enum MEETING_TITLE {
  VIDEO_CALL_ENDED = 'item.meeting.videoCallEnded',
  VIDEO_CALL_IN_PROGRESS = 'item.meeting.videoCallInProgress',
  START_VIDEO_CALL = 'item.meeting.startVideoCall',
  VIDEO_CALL_CANCELLED = 'item.meeting.videoCallCancelled',
}
export { Props, ViewProps, MEETING_TITLE };
