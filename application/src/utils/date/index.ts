import moment from 'moment';
import i18next from 'i18next';
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
    return i18next.t('common.time.today');
  }
  if (diff === 1) {
    return i18next.t('common.time.yesterday');
  }
  if (diff === -1) {
    return i18next.t('common.time.tomorrow');
  }
  if (diff <= 7) {
    return m.format(format); // Tue, Oct 30th  周二, 10月30日
  }
  return m.format('l'); // 30/10/2018  2018/10/30
}

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
  localTime: (m: Moment) => {
    return m.format('LT');
  },
  today: () => {
    return i18next.t('common.time.today');
  },
  yesterday: () => {
    return i18next.t('common.time.yesterday');
  },
  weekday: (m: Moment) => {
    const date = new Date(m.format());
    return i18next.t(WEEKDAY[date.getDay()]);
  },
  exactDate: (m: Moment) => {
    return `${dateFormatter.weekday(m).slice(0, 3)}, ${m.format('l')}`;
  },
  weekdayAndTime: (m: Moment) => {
    return `${dateFormatter.weekday(m).slice(0, 3)}, ${dateFormatter.localTime(
      m,
    )}`;
  },
  dateAndTime: (m: Moment) => {
    return `${dateFormatter.exactDate(m)} ${dateFormatter.localTime(m)}`;
  },
  date: (timestamp: number) => {
    return moment(timestamp).format('l');
  },
  dateAndTimeWithoutWeekday: (m: Moment) => {
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
function getDateTimeStamp(timestamp: number) {
  return moment(timestamp)
    .startOf('day')
    .valueOf();
}
export {
  getDateTimeStamp,
  getDateMessage,
  recentlyTwoDayAndOther,
  dividerTimestamp,
  postTimestamp,
  dateFormatter,
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
