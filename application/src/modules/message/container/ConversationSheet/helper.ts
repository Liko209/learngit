/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-13 14:25:07
 * Copyright © RingCentral. All rights reserved.
 */
import moment from 'moment';
import i18nT from '@/utils/i18nT';

import {
  dateFormatter,
  recentlyTwoDayAndOther,
  getDateMessage,
} from '@/utils/date';

type SheetsType = { [type: string]: number[] };

async function getDateAndTime(timestamp: number): Promise<string> {
  const getAMOrPM: string = dateFormatter.localTime(moment(timestamp));
  const date: string = await recentlyTwoDayAndOther(timestamp);
  return `${date} ${await i18nT('common.time.at')} ${getAMOrPM}`;
}

async function getDurationTime(
  startTimestamp: number,
  endTimestamp: number,
): Promise<string> {
  const startTime = await getDateAndTime(startTimestamp);
  const endTime = await getDateAndTime(endTimestamp);

  const isSameDay = moment(startTimestamp).isSame(endTimestamp, 'day');

  if (isSameDay) {
    return `${startTime} - ${dateFormatter.localTime(moment(endTimestamp))}`;
  }
  return `${startTime} - ${endTime}`;
}

async function getDurationDate(
  startTimestamp: number,
  endTimestamp: number,
): Promise<string> {
  const startTime: string = await recentlyTwoDayAndOther(startTimestamp);
  const endTime: string = await recentlyTwoDayAndOther(endTimestamp);
  const isToday: boolean = startTime.split(' ')[0] === endTime.split(' ')[0];
  const endTimeString: string = isToday ? '' : ` - ${endTime}`;
  return `${startTime}${endTimeString}`;
}

async function getI18Text(type: string, count: number): Promise<string> {
  const timesText: string = await i18nT(type, {
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

async function getDurationTimeText(
  repeat: string,
  repeatEndingAfter: string,
  repeatEndingOn: number | null,
  repeatEnding: string,
): Promise<string> {
  const times: string =
    (TIMES_TEXT[repeat] &&
      (await getI18Text(TIMES_TEXT[repeat], Number(repeatEndingAfter)))) ||
    '';

  const date: string = repeatEndingOn
    ? await dateFormatter.exactDate(moment(repeatEndingOn))
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
  const repeatText = ` ${await i18nT('item.until')} ${date}`;

  return `${(await i18nT(REPEAT_TEXT[repeat])) || ''} ${
    hideTimes(repeatEndingAfter, repeatEnding) ? '' : times
  } ${hideUntil(repeat, repeatEnding) ? '' : repeatText}`;
}

function filterIDsByType(sheets: SheetsType, type: any) {
  let ids: number[] = [];
  if (typeof type === 'function') {
    Object.keys(sheets).forEach((key: string) => {
      if (type(key)) {
        ids = ids.concat(sheets[key]);
      }
    });
    return ids;
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
