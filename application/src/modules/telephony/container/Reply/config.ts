/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-05-06 09:45:29
 * Copyright © RingCentral. All rights reserved.
 */
import {
  RTC_REPLY_MSG_TIME_UNIT,
  RTC_REPLY_MSG_PATTERN,
} from 'sdk/module/telephony';

const predefinedMessage = {
  inMeeting: {
    label: 'inMeeting',
    pattern: RTC_REPLY_MSG_PATTERN.IN_A_MEETING,
  },
  onMyWay: { label: 'onMyWay', pattern: RTC_REPLY_MSG_PATTERN.ON_MY_WAY },
  callMeBack: {
    label: 'callMeBack',
    pattern: RTC_REPLY_MSG_PATTERN.CALL_ME_BACK_LATER,
  },
  willCallBack: {
    label: 'willCallBack',
    pattern: RTC_REPLY_MSG_PATTERN.WILL_CALL_YOU_BACK_LATER,
  },
};

const predefinedTime = [
  { label: '5min', value: 5, unit: RTC_REPLY_MSG_TIME_UNIT.MINUTE },
  { label: '10min', value: 10, unit: RTC_REPLY_MSG_TIME_UNIT.MINUTE },
  { label: '30min', value: 30, unit: RTC_REPLY_MSG_TIME_UNIT.MINUTE },
  { label: '1hour', value: 1, unit: RTC_REPLY_MSG_TIME_UNIT.HOUR },
];

const filterCharacters = '~@#$%^&*()_+{}[]|<>/';
const wordsLimitation = 100;

export { predefinedMessage, predefinedTime, filterCharacters, wordsLimitation };
