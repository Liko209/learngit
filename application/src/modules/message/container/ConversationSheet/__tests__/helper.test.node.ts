/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-09 13:12:42
 * Copyright © RingCentral. All rights reserved.
 */
import {
  filterIDsByType,
  getDurationTime,
  getDateAndTime,
  getDurationDate,
  getDurationTimeText,
} from '../helper';

jest.mock('i18next', () => ({
  languages: ['en'],
  services: {
    backendConnector: {
      state: {
        'en|translation': -1,
      },
    },
  },
  isInitialized: true,
  t: (text: string, object: any) => {
    const args = object ? object.date : '';
    const time = object ? object.time : '';
    return text
      ? args
        ? `${args} ${text.substring(text.lastIndexOf('.') + 1)} ${time}`
        : `${text.substring(text.lastIndexOf('.') + 1)}`
      : args
      ? `${args} ${text}`
      : text;
  },
}));

const DAY = 24 * 3600 * 1000;
const DATE_2019_1_4 = 1546564919703;
const DATE_2019_1_3 = DATE_2019_1_4 - DAY;
const DATE_2019_1_5 = DATE_2019_1_4 + DAY;
const DATE_2019_1_5_12 = 1546617600000;

describe('Conversation sheet helpers', () => {
  describe('getDateAndTime()', () => {
    it('should be today and time when event Date is DATE_2019_1_4 [JPT-712][JPT-713]', async (done: jest.DoneCallback) => {
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      const result = await getDateAndTime(DATE_2019_1_4);
      expect(result).toBe('today dateAtTime 9:21 AM');
      done();
    });
    it('should be yesterday when event Date is DATE_2019_1_4 [JPT-712]][JPT-713]', async (done: jest.DoneCallback) => {
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      const result = await getDateAndTime(DATE_2019_1_3);
      expect(result).toBe('yesterday dateAtTime 9:21 AM');
      done();
    });
    it('should be exactDate when event Date is DATE_2019_1_4 [JPT-712]][JPT-713]', async (done: jest.DoneCallback) => {
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      const result = await getDateAndTime(DATE_2019_1_5);
      expect(result).toBe('Sat, 1/5/2019 dateAtTime 9:21 AM');
      done();
    });
    it('should be exactDate when event Date is DATE_2019_1_4 [JPT-712]][JPT-713]', async (done: jest.DoneCallback) => {
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      const result = await getDateAndTime(DATE_2019_1_5_12);
      expect(result).toBe('Sat, 1/5/2019 dateAtTime 12:00 AM');
      done();
    });
  });
  describe('getDurationTime()', () => {
    it('should be today at 9:21 AM - 9:21 AM when event is not all day event and startDay the same at endDay [JPT-727]', async (done: jest.DoneCallback) => {
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      const result = await getDurationTime(DATE_2019_1_4, DATE_2019_1_4);
      expect(result).toBe('today dateAtTime 9:21 AM - 9:21 AM');
      done();
    });
    it('should be Fri, today at 9:21 AM - Sat, 1/5/2019 at 9:21 AM when event is not all day event and startDay the diff at endDay [JPT-727]', async (done: jest.DoneCallback) => {
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      const result = await getDurationTime(DATE_2019_1_4, DATE_2019_1_5);
      expect(result).toBe('today dateAtTime 9:21 AM - Sat, 1/5/2019 dateAtTime 9:21 AM');
      done();
    });
    it('should be today when event is all day event and startDay the same at endDay [JPT-728]', async (done: jest.DoneCallback) => {
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      const result = await getDurationDate(DATE_2019_1_4, DATE_2019_1_4);
      expect(result).toBe('today');
      done();
    });
    it('should be today, 1/5/2019 when event is all day event and startDay the diff at endDay [JPT-728]', async (done: jest.DoneCallback) => {
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      const result = await getDurationDate(DATE_2019_1_4, DATE_2019_1_5);
      expect(result).toBe('today - Sat, 1/5/2019');
      done();
    });
    it('should be today when event startDate DATE_2019_1_3  [JPT-715]', async (done: jest.DoneCallback) => {
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      const result = await getDurationTime(DATE_2019_1_4, DATE_2019_1_5);
      expect(result).toBe('today dateAtTime 9:21 AM - Sat, 1/5/2019 dateAtTime 9:21 AM');
      done();
    });
    it('should be yesterday when event startDate DATE_2019_1_3 [JPT-715]', async (done: jest.DoneCallback) => {
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      const result = await getDurationTime(DATE_2019_1_3, DATE_2019_1_4);
      expect(result).toBe('yesterday dateAtTime 9:21 AM - today dateAtTime 9:21 AM');
      done();
    });
    it('should be Sat, 1/5/2019 when event startDate DATE_2019_1_5 [JPT-715]', async (done: jest.DoneCallback) => {
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      const result = await getDurationTime(DATE_2019_1_5, DATE_2019_1_4);
      expect(result).toBe('Sat, 1/5/2019 dateAtTime 9:21 AM - today dateAtTime 9:21 AM');
      done();
    });

    it('should be Thu, 1/24/2019 at 2:00 PM - 2:30 PM when event has same day but not today', async (done: jest.DoneCallback) => {
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      const Thu_1_24_2019_2_00PM = 1548309600000; // Thu, 1/24/2019 at 2:00 PM
      const Thu_1_24_2019_2_30PM = 1548311400000; // Thu, 1/24/2019 at 2:30 PM
      const result = await getDurationTime(
        Thu_1_24_2019_2_00PM,
        Thu_1_24_2019_2_30PM,
      );
      expect(result).toBe('Thu, 1/24/2019 dateAtTime 2:00 PM - 2:30 PM');
      done();
    });
  });

  describe('getDurationTimeText()', () => {
    it('should hide `until` when no repeadEndOn', async (done: jest.DoneCallback) => {
      const Thu_1_24_2019_2_00PM = 1548309600000; // Thu, 1/24/2019 at 2:00 PM
      const repeat = ' ';
      const result = await getDurationTimeText(
        repeat,
        `${Thu_1_24_2019_2_00PM}`,
        0,
        '',
      );
      expect(result).toBe('  ');
      done();
    });
  });

  describe('filterIDsByType()', () => {
    it('should filter ids by number type', () => {
      const sheets = {
        1: [1, 2, 3],
        2: [2],
      };
      expect(filterIDsByType(sheets, 1)).toEqual([1, 2, 3]);
      expect(filterIDsByType(sheets, 2)).toEqual([2]);
    });

    it('should filter ids by function type', () => {
      const sheets = {
        1: [1, 2, 3],
        2: [2],
      };
      expect(filterIDsByType(sheets, (type: number) => type > 1)).toEqual([2]);
    });
  });
});
