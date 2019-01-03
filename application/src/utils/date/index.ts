import moment from 'moment';
import { t } from 'i18next';

function getDateMessage(
  timestamp: any,
  format: string = 'ddd, MMM Do',
): string {
  const m = moment(timestamp)
    .hour(0)
    .minute(0)
    .second(0)
    .millisecond(0);
  const now = moment()
    .hour(0)
    .minute(0)
    .second(0)
    .millisecond(0);
  const diff = now.diff(m, 'days', true);
  if (diff === 0) {
    return t('today');
  }
  if (diff === 1) {
    return t('yesterday');
  }
  if (diff === -1) {
    return t('tomorrow');
  }
  if (diff <= 7) {
    return m.format(format); // Tue, Oct 30th  周二, 10月30日
  }
  return m.format('l'); // 30/10/2018  2018/10/30
}

const WEEKDAY = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const formDataReturn = {
  time: (m: any) => {
    return m.format('LT');
  },
  today: () => {
    return t('today');
  },
  yesterday: () => {
    return t('yesterday');
  },
  weekday: (m: any) => {
    const date = new Date(m.format());
    return t(WEEKDAY[date.getDay()]);
  },
  date: (m: any) => {
    return `${formDataReturn.weekday(m).slice(0, 3)}, ${m.format('l')}`;
  },
  weekdayAndTime: (m: any) => {
    return `${formDataReturn.weekday(m).slice(0, 3)}, ${formDataReturn.time(
      m,
    )}`;
  },
  dateAndTime: (m: any) => {
    return `${formDataReturn.date(m)} ${formDataReturn.time(m)}`;
  },
};

const formDataCondition = {
  today: (diff: number) => {
    return diff === 0;
  },
  yesterday: (diff: number) => {
    return diff === 1;
  },
  formTwoToSeven: (diff: number) => {
    return diff < 7 && diff > 1;
  },
  formOneToSeven: (diff: number) => {
    return diff < 7 && diff >= 1;
  },
  overSevenOrFuture: (diff: number) => {
    return diff >= 7 || diff < 0;
  },
  unRecentlyTwoDay: (diff: number) => {
    return diff > 1;
  },
};

function formDate(conditionKey: string[], returnKey: string[]): Function {
  return function (timestamp: any): string {
    const mInit = moment(timestamp);
    const m = moment(timestamp)
      .hour(0)
      .minute(0)
      .second(0)
      .millisecond(0);
    const now = moment()
      .hour(0)
      .minute(0)
      .second(0)
      .millisecond(0);
    const diff = now.diff(m, 'days', true);
    let formatDate = '';
    conditionKey.some((v, i) => {
      if (formDataCondition[v](diff)) {
        formatDate = formDataReturn[returnKey[i]](mInit);
        return true;
      }
      return false;
    });
    return formatDate;
  };
}

const recentlyTwoDayAndOther = formDate(
  ['today', 'yesterday', 'unRecentlyTwoDay'],
  ['today', 'yesterday', 'date'],
);

const dividerTimestamp = formDate(
  ['today', 'yesterday', 'formTwoToSeven', 'overSevenOrFuture'],
  ['today', 'yesterday', 'weekday', 'date'],
);

const postTimestamp = formDate(
  ['today', 'formOneToSeven', 'overSevenOrFuture'],
  ['time', 'weekdayAndTime', 'dateAndTime'],
);

export {
  getDateMessage,
  formDate,
  recentlyTwoDayAndOther,
  formDataCondition,
  formDataReturn,
  WEEKDAY,
  dividerTimestamp,
  postTimestamp,
};

// 7 days inside
// moment().format("ddd, MMM Do");
// "Tue, Nov 13th"

// 7 days inside + time
// moment().format("ddd, MMM Do, h:mm A");
// "Tue, Nov 13th, 8:30 AM"

// 7 days outside
// moment().format("MMM Do, YYYY");
// "Nov 13th, 2018"

// 7 days outside + time
// moment().format('MMM Do YYYY, h:mm A');
// "Nov 13th 2018, 11:33 AM"
