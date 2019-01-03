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

  describe('createTime(). The time format for Conversation. JPT-701', () => {
    it('should toBe today when createdAt in today.', () => {
      timeNodeDividerViewModel.props.value = Date.now();
      expect(timeNodeDividerViewModel.text).toBe('today');
    });
    it('should toBe yesterday when createdAt in yesterday', () => {
      timeNodeDividerViewModel.props.value = Date.now() - 24 * 3600 * 1000;
      expect(timeNodeDividerViewModel.text).toBe('tomorrow');
    });
    it('should toBe Weekday format when createdAt diff > 7 && < 1', () => {
      timeNodeDividerViewModel.props.value = Date.now() - 24 * 3600 * 1000 * 2;
      const days = new Date(timeNodeDividerViewModel.props.value).getDay();
      expect(timeNodeDividerViewModel.text).toBe(WEEKDAY[days]);
    });
    it('should toBe date format when createdAt diff > 7 || < 0', () => {
      timeNodeDividerViewModel.props.value = Date.now() + 24 * 3600 * 1000;
      const days = new Date(timeNodeDividerViewModel.props.value).getDay();
      const dateMoment = moment(timeNodeDividerViewModel.props.value);
      expect(timeNodeDividerViewModel.text).toBe(
        `${WEEKDAY[days].slice(0, 3)}, ${dateMoment.format('l')}`,
      );
    });
  });

  it('get computed text for new messages', () => {
    const FORMAT = 'new messages';
    timeNodeDividerViewModel.props.value = FORMAT;
    expect(timeNodeDividerViewModel.text).toBe(FORMAT);
  });
});
