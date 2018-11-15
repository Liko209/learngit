/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-13 14:25:07
 * Copyright © RingCentral. All rights reserved.
 */
import moment from 'moment';
import { t } from 'i18next';
import { FileItem, ExtendFileItem, FileType } from '@/store/models/Items';

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

const FILE_ICON_MAP = {
  pdf: ['pdf'],
  sheet: ['xlsx', 'xls'],
  ppt: ['ppt', 'pptx', 'potx'],
  ps: ['ps', 'psd'],
};

function getFileIcon(fileType: string) {
  for (const key in FILE_ICON_MAP) {
    if (FILE_ICON_MAP[key].includes(fileType)) {
      return key;
    }
  }
  return null;
}

function getFileType(item: FileItem): ExtendFileItem {
  const fileType: ExtendFileItem = {
    item,
    type: -1,
    previewUrl: '',
  };

  if (image(item).isImage) {
    fileType.type = FileType.image;
    fileType.previewUrl = image(item).previewUrl;
    return fileType;
  }

  if (document(item).isDocument) {
    fileType.type = FileType.document;
    fileType.previewUrl = document(item).previewUrl;
    return fileType;
  }

  fileType.type = FileType.others;
  return fileType;
}

function image(item: FileItem) {
  const { thumbs, type, url } = item;
  const image = {
    isImage: false,
    previewUrl: '',
  };

  if (type === 'gif') {
    image.isImage = true;
    image.previewUrl = url;
    return image;
  }

  if (thumbs) {
    for (const key in thumbs) {
      const value = thumbs[key];
      if (typeof value === 'string' && value.indexOf('http') > -1) {
        image.isImage = true;
        image.previewUrl = thumbs[key];
      }
    }
  }
  return image;
}

function document(item: FileItem) {
  const pages = item.pages;
  const doc = {
    isDocument: false,
    previewUrl: '',
  };
  if (pages && pages.length > 0) {
    doc.isDocument = true;
    doc.previewUrl = pages[0].url;
  }
  return doc;
}

export {
  getDateAndTime,
  getDurationTime,
  getDurationTimeText,
  getFileIcon,
  getFileType,
};
