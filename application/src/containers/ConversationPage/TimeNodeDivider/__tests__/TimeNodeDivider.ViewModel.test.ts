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

describe('TimeNodeDividerViewModel', () => {
  it('get computed text for timestamp', () => {
    const FORMAT = 'today';
    timeNodeDividerViewModel.props.value = Date.now();
    expect(timeNodeDividerViewModel.text).toBe(FORMAT);
  });

  describe('createTime()', () => {
    const dateNow = 1546564919703;
    moment().date(dateNow);
    it('should be today when createdAt in today. [JPT-701]', () => {
      timeNodeDividerViewModel.props.value = dateNow;
      expect(timeNodeDividerViewModel.text).toBe('today');
    });
    it('should be yesterday when createdAt in yesterday. [JPT-701]', () => {
      timeNodeDividerViewModel.props.value = dateNow - 24 * 3600 * 1000;
      expect(timeNodeDividerViewModel.text).toBe('yesterday');
    });
    it('should be Weekday format when createdAt diff > 7 && < 1. [JPT-701]', () => {
      timeNodeDividerViewModel.props.value = dateNow - 24 * 3600 * 1000 * 2;
      expect(timeNodeDividerViewModel.text).toBe('Thursday');
    });
    it('should be date format when createdAt diff > 7 || < 0. [JPT-701]', () => {
      timeNodeDividerViewModel.props.value = dateNow + 24 * 3600 * 1000;
      expect(timeNodeDividerViewModel.text).toBe('Sun, 1/5/2019');
    });
  });

  it('get computed text for new messages', () => {
    const FORMAT = 'new messages';
    timeNodeDividerViewModel.props.value = FORMAT;
    expect(timeNodeDividerViewModel.text).toBe(FORMAT);
  });
});
