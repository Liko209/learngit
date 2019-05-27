/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-04-29 09:49:37
 * Copyright © RingCentral. All rights reserved.
 */
import {
  RTC_REPLY_MSG_PATTERN,
  RTC_REPLY_MSG_TIME_UNIT,
} from 'sdk/module/telephony';

type Props = {};

type ViewProps = {
  replyCountdownTime: number;
  replyWithPattern: (
    pattern: RTC_REPLY_MSG_PATTERN,
    time?: number,
    timeUnit?: RTC_REPLY_MSG_TIME_UNIT,
  ) => () => void;
  replyWithMessage: () => void;
  startReply: () => void;
  quitReply: () => void;
  storeCustomMessage: (msg: string) => void;
  setShiftKeyDown: (down: boolean) => void;
  shiftKeyStatus: boolean;
  customReplyMessage: string;
};

export { Props, ViewProps };
