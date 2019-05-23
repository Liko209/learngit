/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-30 18:39:43
 * Copyright © RingCentral. All rights reserved.
 */
import { TimeNodeDividerViewModel } from '../TimeNodeDivider.ViewModel';

jest.mock('i18next', () => ({
  t: (text: string) => text.substring(text.lastIndexOf('.') + 1),
}));

const timeNodeDividerViewModel = new TimeNodeDividerViewModel();
const DAY = 24 * 3600 * 1000;
const DATE_2019_1_4 = 1546564919703;
const DATE_2019_1_3 = DATE_2019_1_4 - DAY;
const DATE_2019_1_2 = DATE_2019_1_4 - 2 * DAY;
const DATE_2019_1_1 = DATE_2019_1_4 - 3 * DAY;
const DATE_2018_12_30 = DATE_2019_1_4 - 5 * DAY;
const DATE_2018_12_29 = DATE_2019_1_4 - 6 * DAY;
const DATE_2018_12_28 = DATE_2019_1_4 - 7 * DAY;
const DATE_2019_1_5 = DATE_2019_1_4 + DAY;

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
  t: (text: string) => text.substring(text.lastIndexOf('.') + 1),
}));

describe('TimeNodeDividerViewModel', () => {
  describe('text()', () => {
    it('should be today when createdAt is 2019/1/4. [JPT-701]', async (done: jest.DoneCallback) => {
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      timeNodeDividerViewModel.props.value = DATE_2019_1_4;
      expect(await timeNodeDividerViewModel.text.fetch()).toBe('today');
      done();
    });
    it('should be yesterday when createdAt is 2019/1/3. [JPT-701]', async (done: jest.DoneCallback) => {
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      timeNodeDividerViewModel.props.value = DATE_2019_1_3;
      expect(await timeNodeDividerViewModel.text.fetch()).toBe('yesterday');
      done();
    });
    it('should be Weekday format when createdAt is 2019/1/2. [JPT-701]', async (done: jest.DoneCallback) => {
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      timeNodeDividerViewModel.props.value = DATE_2019_1_2;
      expect(await timeNodeDividerViewModel.text.fetch()).toBe('Wednesday');
      done();
    });

    it.each`
      data               | expected
      ${DATE_2019_1_2}   | ${'Wednesday'}
      ${DATE_2019_1_1}   | ${'Tuesday'}
      ${DATE_2018_12_30} | ${'Sunday'}
      ${DATE_2018_12_29} | ${'Saturday'}
    `(
      'should be Weekday format when createdAt is ${data}. [JPT-701]',
      async ({ data, expected }) => {
        global.Date.now = jest.fn(() => DATE_2019_1_4);
        timeNodeDividerViewModel.props.value = data;
        expect(await timeNodeDividerViewModel.text.fetch()).toBe(expected);
      },
    );

    it.each`
      data               | expected
      ${DATE_2019_1_3}   | ${'Monday'}
      ${DATE_2018_12_28} | ${'Friday'}
    `(
      'should not Weekday format when createdAt is ${data}. [JPT-701]',
      async ({ data, expected }) => {
        global.Date.now = jest.fn(() => DATE_2019_1_4);
        timeNodeDividerViewModel.props.value = data;
        expect(await timeNodeDividerViewModel.text.fetch()).not.toBe(expected);
      },
    );
    it('should be date format when createdAt is 2019/1/5. [JPT-701]', async (done: jest.DoneCallback) => {
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      timeNodeDividerViewModel.props.value = DATE_2019_1_5;
      expect(await timeNodeDividerViewModel.text.fetch()).toBe('Sat, 1/5/2019');
      done();
    });

    it('get computed text for new messages', async (done: jest.DoneCallback) => {
      const FORMAT = 'new messages';
      timeNodeDividerViewModel.props.value = FORMAT;
      expect(await timeNodeDividerViewModel.text.fetch()).toBe(FORMAT);
      done();
    });
  });
});
