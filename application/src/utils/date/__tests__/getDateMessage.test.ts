/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-30 14:03:20
 * Copyright © RingCentral. All rights reserved.
 */

import moment from 'moment';
import { getDateMessage, handleTimeZoneOffset } from '../';

jest.mock('i18next', () => ({
  t: (text: string) => text.substring(text.lastIndexOf('.') + 1),
}));

describe('handleTimeZoneOffset()', () => {
  it('should equal when get local timezone offset', () => {
    const timestamp = Number(moment());
    const localTimezoneOffset = moment().utcOffset();
    const result = handleTimeZoneOffset(timestamp, localTimezoneOffset);
    expect(result).toEqual(timestamp);
  });
});

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
