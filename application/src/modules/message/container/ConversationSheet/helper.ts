/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-13 14:25:07
 * Copyright © RingCentral. All rights reserved.
 */
import moment from 'moment';
import { i18nP } from '@/utils/i18nT';

import {
  dateFormatter,
  recentlyTwoDayAndOther,
  getDateMessage,
} from '@/utils/date';

type SheetsType = { [type: string]: number[] };

function getDateAndTime(timestamp: number): string {
  const getAMOrPM: string = dateFormatter.localTime(moment(timestamp));
  const date: string = recentlyTwoDayAndOther(timestamp);
  return `${i18nP('common.time.dateAtTime', { date, time: getAMOrPM })}`;
}

function getDurationTime(startTimestamp: number, endTimestamp: number): string {
  const startTime = getDateAndTime(startTimestamp);
  const endTime = getDateAndTime(endTimestamp);

  const isSameDay = moment(startTimestamp).isSame(endTimestamp, 'day');

  if (isSameDay) {
    return `${startTime} - ${dateFormatter.localTime(moment(endTimestamp))}`;
  }
  return `${startTime} - ${endTime}`;
}

function getDurationDate(startTimestamp: number, endTimestamp: number): string {
  const startTime: string = recentlyTwoDayAndOther(startTimestamp);
  const endTime: string = recentlyTwoDayAndOther(endTimestamp);
  const isToday: boolean = startTime.split(' ')[0] === endTime.split(' ')[0];
  const endTimeString: string = isToday ? '' : ` - ${endTime}`;
  return `${startTime}${endTimeString}`;
}

function getI18Text(type: string, count: number): string {
  const timesText: string = i18nP(type, {
    count,
    postProcess: 'interval',
  });
  return timesText;
}

const REPEAT_TEXT = {
  daily: 'item.repeatingEveryDay', // ', repeating every day',
  weekdaily: 'item.repeatingEveryWeekday',
  weekly: 'item.repeatingEveryWeek',
  monthly: 'item.repeatingEveryMonth',
  yearly: 'item.repeatingEveryYear',
};

const TIMES_TEXT = {
  daily: 'item.forDayTimes_interval',
  weekly: 'item.forWeekTimes_interval',
  weekdaily: 'item.forWeekdailyTimes_interval',
  monthly: 'item.forMonthlyTimes_interval',
  yearly: 'item.forYearlyTimes_interval',
};

function getDurationTimeText(
  repeat: string,
  repeatEndingAfter: string,
  repeatEndingOn: number | null,
  repeatEnding: string,
): string {
  const times: string =
    (TIMES_TEXT[repeat] &&
      getI18Text(TIMES_TEXT[repeat], Number(repeatEndingAfter))) ||
    '';

  const date: string = repeatEndingOn
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
  const repeatText = date ? ` ${i18nP('item.until')} ${date}` : '';

  return `${i18nP(REPEAT_TEXT[repeat]) || ''} ${
    hideTimes(repeatEndingAfter, repeatEnding) ? '' : times
  } ${hideUntil(repeat, repeatEnding) ? '' : repeatText}`;
}

function filterIDsByArrayType(sheets: SheetsType, type: any): number[] {
  let ids: number[] = [];
  (type as Array<number>).forEach(subType => {
    ids = [...ids, ...(sheets[subType] || [])];
  });
  return ids;
}

function filterIDsByFuncType(sheets: SheetsType, type: any): number[] {
  let ids: number[] = [];
  Object.keys(sheets).forEach((key: string) => {
    if (type(key)) {
      ids = [...ids, ...(sheets[key] || [])];
    }
  });
  return ids;
}

function filterIDsByType(sheets: SheetsType, type: any) {
  if (Array.isArray(type)) {
    return filterIDsByArrayType(sheets, type);
  }
  if (typeof type === 'function') {
    return filterIDsByFuncType(sheets, type);
  }
  return sheets[type] || [];
}

export {
  getDateMessage,
  getDateAndTime,
  getDurationTime,
  getDurationDate,
  getDurationTimeText,
  filterIDsByType,
  SheetsType,
};
