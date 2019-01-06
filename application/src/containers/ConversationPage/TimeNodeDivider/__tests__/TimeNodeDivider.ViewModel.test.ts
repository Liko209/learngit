/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-30 18:39:43
 * Copyright © RingCentral. All rights reserved.
 */

import { TimeNodeDividerViewModel } from '../TimeNodeDivider.ViewModel';
import moment from 'moment';

jest.mock('i18next', () => ({
  t: (text: string) => text,
}));

const WEEKDAY = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

jest.mock('i18next', () => ({
  t: (text: string) => text,
}));

const timeNodeDividerViewModel = new TimeNodeDividerViewModel();
const DAY = 24 * 3600 * 1000;
const DATE_2019_1_4 = 1546564919703;
const DATE_2019_1_3 = 1546564919703 - DAY;
const DATE_2019_1_2 = 1546564919703 - 2 * DAY;
const DATE_2019_1_5 = 1546564919703 + DAY;

describe('TimeNodeDividerViewModel', () => {
  describe('text()', () => {
    it('should be today when createdAt is 2019/1/4. [JPT-701]', () => {
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      timeNodeDividerViewModel.props.value = DATE_2019_1_4;
      expect(timeNodeDividerViewModel.text).toBe('today');
    });
    it('should be yesterday when createdAt is 2019/1/3. [JPT-701]', () => {
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      timeNodeDividerViewModel.props.value = DATE_2019_1_3;
      expect(timeNodeDividerViewModel.text).toBe('yesterday');
    });
    it('should be Weekday format when createdAt is 2019/1/2. [JPT-701]', () => {
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      timeNodeDividerViewModel.props.value = DATE_2019_1_2;
      expect(timeNodeDividerViewModel.text).toBe('Wednesday');
    });
    it('should be date format when createdAt is 2019/1/5. [JPT-701]', () => {
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      timeNodeDividerViewModel.props.value = DATE_2019_1_5;
      expect(timeNodeDividerViewModel.text).toBe('Sat, 1/5/2019');
    });

    it('get computed text for new messages', () => {
      const FORMAT = 'new messages';
      timeNodeDividerViewModel.props.value = FORMAT;
      expect(timeNodeDividerViewModel.text).toBe(FORMAT);
    });
  });
});
