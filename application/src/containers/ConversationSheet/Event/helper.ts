import moment from 'moment';
import { t } from 'i18next';

import { getDateMessage } from '@/utils/date';

function getDateAndTime(timestamp: number) {
  const getAMOrPM = moment(timestamp).format('h:mm A');
  const date = getDateMessage(timestamp);

  return `${date} ${t('at')} ${getAMOrPM}`;
}

function getDurationTime(startTimestamp: number, endTimestamp: number) {
  const startTime = getDateAndTime(startTimestamp);
  let endTime = getDateAndTime(endTimestamp);
  const isToday = startTime.split(' ')[0] === endTime.split(' ')[0];

  if (isToday) {
    endTime = endTime.replace(endTime.split(' ')[0], '');
  }
  return `${startTime} - ${endTime}`;
}

function getI18Text(type: string, count: number) {
  return t(type, { count, postProcess: 'interval' });
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
    ? getDateMessage(repeatEndingOn, 'ddd, MMM D')
    : '';
  const hideUntil = (repeat: string, repeatEnding: string) =>
    repeat === 'none' ||
    repeatEnding === 'none' ||
    repeatEnding === 'after' ||
    repeatEndingOn === null;
  // if has repeat and is forever need hide times
  const hideTimes = (repeatEndingAfter: string, repeatEnding: string) =>
    repeatEnding === 'none' || repeatEnding === 'on';
  const repeatText = ` ${t('until')} ${date}`;

  return `${t(REPEAT_TEXT[repeat]) || ''} ${
    hideTimes(repeatEndingAfter, repeatEnding) ? '' : times
  } ${hideUntil(repeat, repeatEnding) ? '' : repeatText}`;
}

export { getDateAndTime, getDurationTime, getDurationTimeText };
