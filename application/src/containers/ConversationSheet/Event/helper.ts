import moment from 'moment';
import { t } from 'i18next';

import { getDateMessage } from '@/utils/date';

function getDateAndTime(timestamp: number) {
  const getAMOrPM = moment(timestamp).format('h:mm A');
  const date = getDateMessage(timestamp);

  return `${date} ${t('at')} ${getAMOrPM}`;
}

function getDurtionTime(startTimestamp: number, endTimestamp: number) {
  const startTime = getDateAndTime(startTimestamp);
  let endTime = getDateAndTime(endTimestamp);
  const isToday = startTime.split(' ')[0] === endTime.split(' ')[0];

  if (isToday) {
    endTime = endTime.replace(endTime.split(' ')[0], '');
  }
  return `${startTime} - ${endTime}`;
}

const REPEAT_TEXT = {
  daily: 'repeatingEveryDay', // ', repeating every day',
  weekdaily: 'repeatingEveryWeek',
  weekly: 'repeatingEveryWeek',
  monthly: 'repeatingEveryMonth',
  yearly: 'repeatingEveryYear',
};

const TIMES_TEXT = {
  daily: (count: number) => t('forDayTimes', { count }),
  weekly: (count: number) => t('forWeekTimes', { count }),
  weekdaily: (count: number) => t('forWeekTimes', { count }),
  monthly: (count: number) => t('forMonthlyTimes', { count }),
  yearly: (count: number) => t('forYearlyTimes', { count }),
};

function getDurtionTimeText(
  repeat: string,
  repeatEndingAfter: string,
  repeatEndingOn: string,
  repeatEnding: string,
) {
  const times =
    (TIMES_TEXT[repeat] && TIMES_TEXT[repeat](Number(repeatEndingAfter))) || '';
  const date = repeatEndingOn
    ? getDateMessage(repeatEndingOn, 'ddd, MMM D')
    : '';
  const hideUntil = (repeat: string, repeatEnding: string) =>
    repeat === 'none' || repeatEnding === 'none' || repeatEnding === 'after';
  // if has repeat and is forever need hide times
  const hideTimes = (repeatEndingAfter: string, repeatEnding: string) =>
    repeatEndingAfter === '1' && repeatEnding === 'none';
  const repeatText = ` ${t('until')} ${date}`;

  return `${t(REPEAT_TEXT[repeat]) || ''} ${
    hideTimes(repeatEndingAfter, repeatEnding) ? '' : times
  } ${hideUntil(repeat, repeatEnding) ? '' : repeatText}`;
}

export { getDateAndTime, getDurtionTime, getDurtionTimeText };
