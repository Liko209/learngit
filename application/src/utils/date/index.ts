import moment from 'moment';
import { i18nP } from '@/utils/i18nT';
import _ from 'lodash';

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
    return i18nP('common.time.today');
  }
  if (diff === 1) {
    return i18nP('common.time.yesterday');
  }
  if (diff === -1) {
    return i18nP('common.time.tomorrow');
  }
  if (diff <= 7) {
    return m.format(format); // Tue, Oct 30th  周二, 10月30日
  }
  return m.format('l'); // 30/10/2018  2018/10/30
}

const DATE_FORMAT = {
  short: 'short',
  full: 'full',
};

const WEEKDAY = [
  'common.time.Sunday',
  'common.time.Monday',
  'common.time.Tuesday',
  'common.time.Wednesday',
  'common.time.Thursday',
  'common.time.Friday',
  'common.time.Saturday',
];

type Moment = moment.Moment;

const dateFormatter = {
  localTime: (m: Moment): string => {
    return m.format('LT');
  },
  today: (): string => {
    const text: string = i18nP('common.time.today');
    return text;
  },
  yesterday: (): string => {
    const text: string = i18nP('common.time.yesterday');
    return text;
  },
  weekday: (m: Moment): string => {
    const text: string = i18nP(WEEKDAY[m.day()]);
    return text;
  },
  exactDate: (m: Moment): string => {
    const weekday: string = dateFormatter.weekday(m);
    return `${weekday.slice(0, 3)}, ${m.format('l')}`;
  },
  weekdayAndTime: (m: Moment): string => {
    const weekday: string = dateFormatter.weekday(m);
    return `${weekday.slice(0, 3)}, ${dateFormatter.localTime(m)}`;
  },
  dateAndTime: (m: Moment): string => {
    return `${dateFormatter.exactDate(m)} ${dateFormatter.localTime(m)}`;
  },
  date: (timestamp: number): string => {
    return moment(timestamp).format('l');
  },
  dateAndTimeWithoutWeekday: (m: Moment): string => {
    return `${m.format('l')} ${dateFormatter.localTime(m)}`;
  },
};

const condition = {
  isZero: (diff: number) => {
    return diff === 0;
  },
  isOne: (diff: number) => {
    return diff === 1;
  },
  fromTwoToSix: (diff: number) => {
    return _.inRange(diff, 2, 7);
  },
  fromOneToSix: (diff: number) => {
    return _.inRange(diff, 1, 7);
  },
  overSevenOrLessZero: (diff: number) => {
    return 0 > diff || diff >= 7;
  },
  overOne: (diff: number) => {
    return !_.inRange(diff, 0, 1);
  },
};

function buildFormatter(
  buildCondition: { condition: Function; formatter: Function }[],
): Function {
  return function (timestamp: Date): string {
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
    buildCondition.some((v, i) => {
      if (v.condition(diff)) {
        formatDate = v.formatter(mInit);
        return true;
      }
      return false;
    });
    return formatDate;
  };
}

const recentlyTwoDayAndOther = buildFormatter([
  {
    condition: condition.isZero,
    formatter: dateFormatter.today,
  },
  {
    condition: condition.isOne,
    formatter: dateFormatter.yesterday,
  },
  {
    condition: condition.overOne,
    formatter: dateFormatter.exactDate,
  },
]);

const dividerTimestamp = buildFormatter([
  {
    condition: condition.isZero,
    formatter: dateFormatter.today,
  },
  {
    condition: condition.isOne,
    formatter: dateFormatter.yesterday,
  },
  {
    condition: condition.fromTwoToSix,
    formatter: dateFormatter.weekday,
  },
  {
    condition: condition.overSevenOrLessZero,
    formatter: dateFormatter.exactDate,
  },
]);

const postTimestamp = buildFormatter([
  {
    condition: condition.isZero,
    formatter: dateFormatter.localTime,
  },
  {
    condition: condition.fromOneToSix,
    formatter: dateFormatter.weekdayAndTime,
  },
  {
    condition: condition.overSevenOrLessZero,
    formatter: dateFormatter.dateAndTime,
  },
]);

function getDateTimeStamp(timestamp: number): number {
  return moment(timestamp)
    .startOf('day')
    .valueOf();
}

function handleTimeZoneOffset(
  timestamp: number,
  timezoneOffset: number,
): number {
  const localTimezoneOffset = moment().utcOffset();
  const MINUTE = 60 * 1000;
  return timestamp + (localTimezoneOffset - timezoneOffset) * MINUTE;
}

function twoDigit(n: number): string {
  return (n < 10 ? '0' : '') + n;
}

function getHourMinuteSeconds(seconds: number) {
  let secondTime = seconds;
  let minuteTime = 0;
  let hourTime = 0;
  if (secondTime >= 60) {
    // @ts-ignore
    minuteTime = parseInt(secondTime / 60, 10);
    // @ts-ignore
    secondTime = parseInt(secondTime % 60, 10);
    if (minuteTime >= 60) {
      // @ts-ignore
      hourTime = parseInt(minuteTime / 60, 10);
      // @ts-ignore
      minuteTime = parseInt(minuteTime % 60, 10);
    }
  }
  return {
    secondTime,
    minuteTime,
    hourTime,
  };
}

function formatSeconds(seconds: number) {
  const { secondTime, minuteTime, hourTime } = getHourMinuteSeconds(seconds);
  return {
    secondTime: twoDigit(secondTime),
    minuteTime: twoDigit(minuteTime),
    hourTime: twoDigit(hourTime),
  };
}
function formatDuration(milliSeconds: number) {
  const hours = Math.floor((milliSeconds / (1000 * 60 * 60)) % 24);
  if (hours >= 1) {
    return moment.utc(milliSeconds).format('HH:mm:ss');
  }
  return moment.utc(milliSeconds).format('mm:ss');
}

function getCreateTime(creationTime: string, dateFormat: string) {
  if (dateFormat === DATE_FORMAT.short) {
    return moment(creationTime).format('hh MM A');
  }
  return postTimestamp(creationTime);
}
export {
  getDateTimeStamp,
  getDateMessage,
  recentlyTwoDayAndOther,
  dividerTimestamp,
  postTimestamp,
  dateFormatter,
  handleTimeZoneOffset,
  formatSeconds,
  getHourMinuteSeconds,
  formatDuration,
  getCreateTime,
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
