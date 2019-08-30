/*
 * @Author: cooper.ruan
 * @Date: 2019-07-29 10:44:29
 * Copyright © RingCentral. All rights reserved.
 */
import { PromisedComputedValue } from 'computed-async-mobx';

type MeetingProps = {
  variant?: 'round' | 'plain';
  groupId?: number;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
};

type MeetingViewProps = {
  startMeeting: () => void;
  showIcon: PromisedComputedValue<boolean>;
};

export { MeetingProps, MeetingViewProps };
