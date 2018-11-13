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
  weekdaily: 'repeatingEveryWeekday',
  weekly: 'repeatingEveryWeek',
  monthly: 'repeatingEveryMonth',
  yearly: 'repeatingEveryYear',
};

const TIMES_TEXT = {
  daily: (count: number) =>
    t('forDayTimes_interval', { count, postProcess: 'interval' }),
  weekly: (count: number) =>
    t('forWeekTimes_interval', { count, postProcess: 'interval' }),
  weekdaily: (count: number) =>
    t('forWeekdailyTimes_interval', { count, postProcess: 'interval' }),
  monthly: (count: number) =>
    t('forMonthlyTimes_interval', { count, postProcess: 'interval' }),
  yearly: (count: number) =>
    t('forYearlyTimes_interval', { count, postProcess: 'interval' }),
};

function getDurtionTimeText(
  repeat: string,
  repeatEndingAfter: string,
  repeatEndingOn: string,
  repeatEnding: string,
) {
  console.log(
    repeat, // weekly
    repeatEndingAfter, // 1
    repeatEndingOn, // null
    repeatEnding, // none
    '-----event',
  );
  const times =
    (TIMES_TEXT[repeat] && TIMES_TEXT[repeat](Number(repeatEndingAfter))) || '';
  console.log(
    t('key2_interval', { postProcess: 'interval', count: 4 }),
    '---event -ttt',
  );
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
