/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-08 17:20:01
 * Copyright © RingCentral. All rights reserved.
 */
import moment from 'moment';
import { t } from 'i18next';
import getDateMessage from './getDateMessage';

function compareCharacters(a: string, b: string) {
  if (a === b) {
    return 0;
  }
  const priority = (char: string) =>
    !char ? 0 : /[a-z]/i.test(char) ? 1 : /[0-9]/.test(char) ? 2 : 3;
  return (
    priority(a) - priority(b) || a.toLowerCase().localeCompare(b.toLowerCase())
  );
}

function compareName(nameOne: string, nameTwo: string) {
  const maxLength = Math.max(nameOne.length, nameTwo.length);
  for (let i = 0; i < maxLength; i += 1) {
    const result = compareCharacters(nameOne[i], nameTwo[i]);
    if (result !== 0) {
      return result;
    }
  }
  return 0;
}

function toTitleCase(input: string) {
  const allTitleCase = input
    .toLowerCase()
    .replace(/(?:^|\s|-)\S/g, x => x.toUpperCase());
  const smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|v.?|vs.?|via)$/i;
  const wordSeparators = /([ :–—-])/;
  return allTitleCase
    .split(wordSeparators)
    .map((current: string) => {
      if (current.search(smallWords) > -1) {
        return current.toLowerCase();
      }
      return current;
    })
    .join('');
}

function isOnlyLetterOrNumbers(value: string) {
  const REG_NUM_LETTER = /^[0-9A-Za-z\s\-~`!@#$%^&*()-_+=\[\]{};:"',<.>\/?，。？￥！……【】’“；《》（）]+$/;
  return REG_NUM_LETTER.test(value);
}

function toUpperCase(name: string | undefined) {
  return (name && name.slice(0, 1).toUpperCase()) || '';
}

function handleOnlyLetterOrNumbers(firstName: string, lastName: string) {
  const firstLetter = toUpperCase(firstName!);
  const lastLetter = toUpperCase(lastName!);
  return `${firstLetter}${lastLetter}`;
}

function handleOneOfName(firstName: string, lastName: string) {
  if (!isOnlyLetterOrNumbers(firstName) && !isOnlyLetterOrNumbers(lastName)) {
    return '';
  }
  const names =
    (!!firstName && firstName!.split(/\s+/)) ||
    (!!lastName && lastName!.split(/\s+/));
  const firstLetter = toUpperCase(names[0]);
  const lastLetter = toUpperCase(names[1]);
  return `${firstLetter}${lastLetter}`;
}

function getFileSize(bytes: number) {
  if (bytes / 1024 < 1000) {
    return `${(bytes / 1024).toFixed(1)}Kb`;
  }
  if (bytes / 1024 / 1024 < 1000) {
    return `${(bytes / 1024 / 1024).toFixed(1)}Mb`;
  }
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)}Gb`;
}

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

function getDurationTimeText(
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

export {
  compareName,
  toTitleCase,
  isOnlyLetterOrNumbers,
  handleOnlyLetterOrNumbers,
  handleOneOfName,
  getFileSize,
  getDateAndTime,
  getDurationTime,
  getDurationTimeText,
};
