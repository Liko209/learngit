/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-30 14:03:20
 * Copyright © RingCentral. All rights reserved.
 */

import moment from 'moment';
import {
  getDateMessage,
  formDate,
  formDataReturn,
  formDataCondition,
  WEEKDAY,
} from '../';
import { t } from 'i18next';

jest.mock('i18next', () => ({
  t: (text: string) => text,
}));

describe('getDateMessage', () => {
  it('today', () => {
    const FORMAT = 'today';
    const timestamp = moment();
    const result = getDateMessage(timestamp);
    expect(result).toEqual(FORMAT);
  });

  it('yesterday', () => {
    const FORMAT = 'yesterday';
    const timestamp = moment().subtract(1, 'day');
    const result = getDateMessage(timestamp);
    expect(result).toEqual(FORMAT);
  });

  it('current date - 7 <= post sent date < current date', () => {
    const FORMAT = 'ddd, MMM Do';

    const timestamp1 = moment().subtract(2, 'day');
    const result1 = getDateMessage(timestamp1);
    expect(result1).toEqual(timestamp1.format(FORMAT));

    const timestamp2 = moment().subtract(7, 'day');
    const result2 = getDateMessage(timestamp2);
    expect(result2).toEqual(timestamp2.format(FORMAT));
  });

  it('message sent date < current date - 7', () => {
    const FORMAT = 'l';

    const timestamp1 = moment().subtract(8, 'day');
    const result1 = getDateMessage(timestamp1);
    expect(result1).toEqual(timestamp1.format(FORMAT));

    const timestamp2 = moment().subtract(9, 'day');
    const result2 = getDateMessage(timestamp2);
    expect(result2).toEqual(timestamp2.format(FORMAT));
  });
});

describe('formDataReturn', () => {
  it('should equal exact time when get exact time', () => {
    const timestamp = moment();
    const result = formDataReturn.time(timestamp);
    expect(result).toEqual(timestamp.format('LT'));
  });
  it('should equal today when date in today', () => {
    const FORMAT = 'today';
    const result = formDataReturn.today();
    expect(result).toEqual(FORMAT);
  });

  it('should equal yesterday when date in yesterday', () => {
    const FORMAT = 'yesterday';
    const result = formDataReturn.yesterday();
    expect(result).toEqual(FORMAT);
  });

  it('should equal weekday when get weekday', () => {
    const timestamp = moment();
    const days = new Date(timestamp.format()).getDay();
    const result = formDataReturn.weekday(timestamp);
    expect(result).toEqual(t(WEEKDAY[days]));
  });

  it('should equal date when get date', () => {
    const timestamp = moment();
    const days = new Date(timestamp.format()).getDay();
    const result = formDataReturn.date(timestamp);
    expect(result).toEqual(
      `${t(WEEKDAY[days]).slice(0, 3)}, ${timestamp.format('l')}`,
    );
  });

  it('should equal weekday + Time when get weekdayAndTime', () => {
    const timestamp = moment();
    const days = new Date(timestamp.format()).getDay();
    const result = formDataReturn.weekdayAndTime(timestamp);
    expect(result).toEqual(
      `${t(WEEKDAY[days]).slice(0, 3)}, ${timestamp.format('LT')}`,
    );
  });

  it('should equal date + Time when get dateAndTime', () => {
    const timestamp = moment();
    const days = new Date(timestamp.format()).getDay();
    const result = formDataReturn.dateAndTime(timestamp);
    expect(result).toEqual(
      `${t(WEEKDAY[days]).slice(0, 3)}, ${timestamp.format(
        'l',
      )} ${timestamp.format('LT')}`,
    );
  });
});

describe('formDataCondition', () => {
  it('should today equal true when diff is 0', () => {
    const result = formDataCondition.today(0);
    expect(result).toEqual(true);
  });
  it('should yesterday equal true when diff is 1', () => {
    const result = formDataCondition.yesterday(1);
    expect(result).toEqual(true);
  });
  it('should formTwoToSeven equal true when diff > 1 && < 7', () => {
    const result = formDataCondition.formOneToSeven(2);
    expect(result).toEqual(true);
  });

  it('should formOneToSeven equal true when diff >= 1 && < 7', () => {
    const result = formDataCondition.formOneToSeven(1);
    expect(result).toEqual(true);
  });
  it('should overSevenOrFuture equal true when diff > 7 || < 0', () => {
    const result = formDataCondition.overSevenOrFuture(9);
    expect(result).toEqual(true);
    const result1 = formDataCondition.overSevenOrFuture(-1);
    expect(result1).toEqual(true);
  });

  it('should unRecentlyTwoDay equal true when diff > 1', () => {
    const result = formDataCondition.unRecentlyTwoDay(2);
    expect(result).toEqual(true);
  });
});

const addDays = function (days: number) {
  const dat = new Date();
  dat.setDate(dat.getDate() + days);
  return dat;
};

describe('formDate', () => {
  const formDateFun = formDate(['today', 'yesterday'], ['today', 'yesterday']);
  it('should today equal when date is today', () => {
    expect(formDateFun(moment().format())).toEqual(t('today'));
  });
  it('should yesterday equal when date is yesterday', () => {
    const timestamp = moment(addDays(-1)).format();
    expect(formDateFun(timestamp)).toEqual(t('yesterday'));
  });

  const twoDayLater = addDays(-2);
  const twoDayLaterMoment = moment(twoDayLater);
  const days = new Date(twoDayLater).getDay();

  it('should time equal when date is unRecentlyTwoDay', () => {
    const formDateFun = formDate(['unRecentlyTwoDay'], ['time']);
    expect(formDateFun(twoDayLater)).toEqual(twoDayLaterMoment.format('LT'));
  });
  it('should date equal when date is unRecentlyTwoDay', () => {
    const formDateFun = formDate(['unRecentlyTwoDay'], ['date']);
    expect(formDateFun(twoDayLater)).toEqual(
      `${t(WEEKDAY[days]).slice(0, 3)}, ${twoDayLaterMoment.format('l')}`,
    );
  });

  it('should weekday equal when date is unRecentlyTwoDay', () => {
    const formDateFun = formDate(['unRecentlyTwoDay'], ['weekday']);
    expect(formDateFun(twoDayLater)).toEqual(t(WEEKDAY[days]));
  });
  it('should weekdayAndTime equal when date is unRecentlyTwoDay', () => {
    const formDateFun = formDate(['unRecentlyTwoDay'], ['weekdayAndTime']);
    expect(formDateFun(twoDayLater)).toEqual(
      `${t(WEEKDAY[days]).slice(0, 3)}, ${twoDayLaterMoment.format('LT')}`,
    );
  });
  it('should dateAndTime equal when date is unRecentlyTwoDay', () => {
    const formDateFun = formDate(['unRecentlyTwoDay'], ['dateAndTime']);
    expect(formDateFun(twoDayLater)).toEqual(
      `${t(WEEKDAY[days]).slice(0, 3)}, ${twoDayLaterMoment.format(
        'l',
      )} ${twoDayLaterMoment.format('LT')}`,
    );
  });
});
