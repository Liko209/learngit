/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-09 13:12:42
 * Copyright © RingCentral. All rights reserved.
 */
import { getDurationTime, getDateAndTime, getDurationDate } from '../helper';

jest.mock('i18next', () => ({
  t: (text: string) => text.substring(text.lastIndexOf('.') + 1),
}));

const DAY = 24 * 3600 * 1000;
const DATE_2019_1_4 = 1546564919703;
const DATE_2019_1_3 = DATE_2019_1_4 - DAY;
const DATE_2019_1_5 = DATE_2019_1_4 + DAY;
const DATE_2019_1_5_12 = 1546617600000;

describe('Conversation sheet helpers', () => {
  describe('getDateAndTime()', () => {
    it('should be today and time when event Date is DATE_2019_1_4 [JPT-712][JPT-713]', () => {
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      const result = getDateAndTime(DATE_2019_1_4);
      expect(result).toBe('today at 9:21 AM');
    });
    it('should be yesterday when event Date is DATE_2019_1_4 [JPT-712]][JPT-713]', () => {
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      const result = getDateAndTime(DATE_2019_1_3);
      expect(result).toBe('yesterday at 9:21 AM');
    });
    it('should be exactDate when event Date is DATE_2019_1_4 [JPT-712]][JPT-713]', () => {
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      const result = getDateAndTime(DATE_2019_1_5);
      expect(result).toBe('Sat, 1/5/2019 at 9:21 AM');
    });
    it('should be exactDate when event Date is DATE_2019_1_4 [JPT-712]][JPT-713]', () => {
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      const result = getDateAndTime(DATE_2019_1_5_12);
      expect(result).toBe('Sat, 1/5/2019 at 12:00 AM');
    });
  });
  describe('getDurationTime()', () => {
    it('should be today at 9:21 AM - 9:21 AM when event is not all day event and startDay the same at endDay [JPT-727]', () => {
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      const result = getDurationTime(DATE_2019_1_4, DATE_2019_1_4);
      expect(result).toBe('today at 9:21 AM - 9:21 AM');
    });
    it('should be Fri, today at 9:21 AM - Sat, 1/5/2019 at 9:21 AM when event is not all day event and startDay the diff at endDay [JPT-727]', () => {
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      const result = getDurationTime(DATE_2019_1_4, DATE_2019_1_5);
      expect(result).toBe('today at 9:21 AM - Sat, 1/5/2019 at 9:21 AM');
    });
    it('should be today when event is all day event and startDay the same at endDay [JPT-728]', () => {
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      const result = getDurationDate(DATE_2019_1_4, DATE_2019_1_4);
      expect(result).toBe('today');
    });
    it('should be today, 1/5/2019 when event is all day event and startDay the diff at endDay [JPT-728]', () => {
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      const result = getDurationDate(DATE_2019_1_4, DATE_2019_1_5);
      expect(result).toBe('today - Sat, 1/5/2019');
    });
    it('should be today when event startDate DATE_2019_1_3  [JPT-715]', () => {
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      const result = getDurationTime(DATE_2019_1_4, DATE_2019_1_5);
      expect(result).toBe('today at 9:21 AM - Sat, 1/5/2019 at 9:21 AM');
    });
    it('should be yesterday when event startDate DATE_2019_1_3 [JPT-715]', () => {
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      const result = getDurationTime(DATE_2019_1_3, DATE_2019_1_4);
      expect(result).toBe('yesterday at 9:21 AM - today at 9:21 AM');
    });
    it('should be Sat, 1/5/2019 when event startDate DATE_2019_1_5 [JPT-715]', () => {
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      const result = getDurationTime(DATE_2019_1_5, DATE_2019_1_4);
      expect(result).toBe('Sat, 1/5/2019 at 9:21 AM - today at 9:21 AM');
    });

    it('should be Thu, 1/24/2019 at 2:00 PM - 2:30 PM when event has same day but not today', () => {
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      const Thu_1_24_2019_2_00PM = 1548309600000; // Thu, 1/24/2019 at 2:00 PM
      const Thu_1_24_2019_2_30PM = 1548311400000; // Thu, 1/24/2019 at 2:30 PM
      const result = getDurationTime(
        Thu_1_24_2019_2_00PM,
        Thu_1_24_2019_2_30PM,
      );
      expect(result).toBe('Thu, 1/24/2019 at 2:00 PM - 2:30 PM');
    });
  });
});
