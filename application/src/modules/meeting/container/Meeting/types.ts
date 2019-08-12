/*
 * @Author: cooper.ruan
 * @Date: 2019-07-29 10:44:29
 * Copyright © RingCentral. All rights reserved.
 */
import { PromisedComputedValue } from 'computed-async-mobx';

type MeetingProps = {
  phone?: string;
  variant?: 'round' | 'plain';
  id?: number;
  groupId?: number;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  onClick?: () => void;
  analysisSource?: string;
};

type MeetingViewProps = {
  phoneNumber: string;
  startMeeting: () => void;
  trackMeeting: (analysisSource?: string) => void;
  showIcon: PromisedComputedValue<boolean>;
};

export { MeetingProps, MeetingViewProps };
