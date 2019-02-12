/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-13 14:25:07
 * Copyright © RingCentral. All rights reserved.
 */
import moment from 'moment';
import i18next from 'i18next';

import {
  dateFormatter,
  recentlyTwoDayAndOther,
  getDateMessage,
} from '@/utils/date';

function getDateAndTime(timestamp: number) {
  const getAMOrPM = dateFormatter.localTime(moment(timestamp));
  const date = recentlyTwoDayAndOther(timestamp);
  return `${date} ${i18next.t('at')} ${getAMOrPM}`;
}

function getDurationTime(startTimestamp: number, endTimestamp: number) {
  const startTime = getDateAndTime(startTimestamp);
  const endTime = getDateAndTime(endTimestamp);

  const isSameDay = moment(startTimestamp).isSame(endTimestamp, 'day');

  if (isSameDay) {
    return `${startTime} - ${dateFormatter.localTime(moment(endTimestamp))}`;
  }
  return `${startTime} - ${endTime}`;
}

function getDurationDate(startTimestamp: number, endTimestamp: number) {
  const startTime = recentlyTwoDayAndOther(startTimestamp);
  const endTime = recentlyTwoDayAndOther(endTimestamp);
  const isToday = startTime.split(' ')[0] === endTime.split(' ')[0];
  const endTimeString = isToday ? '' : ` - ${endTime}`;
  return `${startTime}${endTimeString}`;
}

function getI18Text(type: string, count: number) {
  return i18next.t(type, { count, postProcess: 'interval' });
}

const REPEAT_TEXT = {
  daily: 'repeatingEveryDay', // ', repeating every day',
  weekdaily: 'repeatingEveryWeekday',
  weekly: 'repeatingEveryWeek',
  monthly: 'repeatingEveryMonth',
  yearly: 'repeatingEveryYear',
};

const TIMES_TEXT = {
  daily: 'forDayTimes_interval',
  weekly: 'forWeekTimes_interval',
  weekdaily: 'forWeekdailyTimes_interval',
  monthly: 'forMonthlyTimes_interval',
  yearly: 'forYearlyTimes_interval',
};

function getDurationTimeText(
  repeat: string,
  repeatEndingAfter: string,
  repeatEndingOn: string,
  repeatEnding: string,
) {
  const times =
    (TIMES_TEXT[repeat] &&
      getI18Text(TIMES_TEXT[repeat], Number(repeatEndingAfter))) ||
    '';

  const date = repeatEndingOn
    ? dateFormatter.exactDate(moment(repeatEndingOn))
    : '';
  const hideUntil = (repeat: string, repeatEnding: string) =>
    repeat === '' || // task not set repeat will be ''
    repeat === 'none' ||
    repeatEnding === 'none' ||
    repeatEnding === 'after' ||
    repeatEndingOn === null;
  // if has repeat and is forever need hide times
  const hideTimes = (repeatEndingAfter: string, repeatEnding: string) =>
    repeatEnding === 'none' || repeatEnding === 'on';
  const repeatText = ` ${i18next.t('until')} ${date}`;

  return `${i18next.t(REPEAT_TEXT[repeat]) || ''} ${
    hideTimes(repeatEndingAfter, repeatEnding) ? '' : times
  } ${hideUntil(repeat, repeatEnding) ? '' : repeatText}`;
}

export {
  getDateMessage,
  getDateAndTime,
  getDurationTime,
  getDurationDate,
  getDurationTimeText,
};
