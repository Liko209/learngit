/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-23 15:33:02
 * Copyright © RingCentral. All rights reserved.
 */
import { container, Jupiter } from 'framework';
import { getEntity } from '@/store/utils';
import { ConversationCardViewModel } from '../ConversationCard.ViewModel';
import { config } from '@/modules/GlobalSearch/module.config';

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

jest.mock('@/store/utils');

const jupiter = container.get(Jupiter);
jupiter.registerModule(config);

const conversationCardVM = new ConversationCardViewModel();

const DAY = 24 * 3600 * 1000;
const DATE_2019_1_4 = 1546564919703;
const DATE_2019_1_3 = DATE_2019_1_4 - DAY;
const DATE_2019_1_2 = DATE_2019_1_4 - 2 * DAY;
const DATE_2019_1_1 = DATE_2019_1_4 - 3 * DAY;
const DATE_2018_12_30 = DATE_2019_1_4 - 5 * DAY;
const DATE_2018_12_29 = DATE_2019_1_4 - 6 * DAY;
const DATE_2018_12_28 = DATE_2019_1_4 - 7 * DAY;
const DATE_2019_1_5 = DATE_2019_1_4 + DAY;

describe('ConversationCardViewModel', () => {
  beforeAll(() => {
    jest.resetAllMocks();
  });
  it('post()', () => {
    const mockPostValue = {
      atMentionNonItemIds: [1234],
      text: 'abcd  efg',
    };
    (getEntity as jest.Mock).mockReturnValue({
      ...mockPostValue,
    });
    expect(conversationCardVM.post).toMatchObject({
      ...mockPostValue,
    });
  });

  describe('createTime()', () => {
    it('should be timeAndDate format when mode is navigation [JPT-705]', async (done: jest.DoneCallback) => {
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      conversationCardVM.props.mode = 'navigation';
      (getEntity as jest.Mock).mockReturnValue({
        createdAt: DATE_2019_1_4,
        creatorId: 107913219,
      });
      expect(await conversationCardVM.createTime.fetch()).toBe(
        'Fri, 1/4/2019 9:21 AM',
      );
      conversationCardVM.props.mode = undefined;
      done();
    });
    it('should be time format when createdAt is 2019/1/4 [JPT-701]', async (done: jest.DoneCallback) => {
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      (getEntity as jest.Mock).mockReturnValue({
        createdAt: DATE_2019_1_4,
        creatorId: 107913219,
      });
      expect(await conversationCardVM.createTime.fetch()).toBe('9:21 AM');
      done();
    });
    it('should be weekdayAndTime format when createdAt is 2019/1/3 [JPT-701]', async (done: jest.DoneCallback) => {
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      (getEntity as jest.Mock).mockReturnValue({
        createdAt: DATE_2019_1_3,
        creatorId: 107913219,
      });
      expect(await conversationCardVM.createTime.fetch()).toBe('Thu, 9:21 AM');
      done();
    });
    it('should be dateAndTime format when createdAt is 2019/1/5 [JPT-701]', async (done: jest.DoneCallback) => {
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      (getEntity as jest.Mock).mockReturnValue({
        createdAt: DATE_2019_1_5,
        creatorId: 107913219,
      });
      expect(await conversationCardVM.createTime.fetch()).toBe(
        'Sat, 1/5/2019 9:21 AM',
      );
      done();
    });
    it.each`
      data               | expected
      ${DATE_2019_1_3}   | ${'Thu, 9:21 AM'}
      ${DATE_2019_1_2}   | ${'Wed, 9:21 AM'}
      ${DATE_2018_12_30} | ${'Sun, 9:21 AM'}
      ${DATE_2018_12_29} | ${'Sat, 9:21 AM'}
    `(
      'should be Weekday format when createdAt is ${data}. [JPT-701]',
      async ({ data, expected }) => {
        global.Date.now = jest.fn(() => DATE_2019_1_4);
        (getEntity as jest.Mock).mockReturnValue({
          createdAt: data,
          creatorId: 107913219,
        });
        expect(await conversationCardVM.createTime.fetch()).toBe(expected);
      },
    );
    it.each`
      data               | expected
      ${DATE_2019_1_1}   | ${'Mon, 9:21 AM'}
      ${DATE_2018_12_28} | ${'Fri, 9:21 AM'}
    `(
      'should not Weekday format when createdAt is ${data}. [JPT-701]',
      async ({ data, expected }) => {
        global.Date.now = jest.fn(() => DATE_2019_1_4);
        (getEntity as jest.Mock).mockReturnValue({
          createdAt: data,
          creatorId: 107913219,
        });
        expect(await conversationCardVM.createTime.fetch()).not.toBe(expected);
      },
    );
  });
  it('creator()', () => {
    (getEntity as jest.Mock).mockReturnValue({
      createdAt: 1540279718268,
      creatorId: 107913219,
      id: 1491222532,
    });
    expect(conversationCardVM.creator).toMatchObject({
      id: 1491222532,
    });
  });
  it('name()', () => {
    (getEntity as jest.Mock).mockReturnValue({
      displayName: 'alvin',
      id: 1491222532,
    });
    expect(conversationCardVM.name).toBe(undefined);
  });
  it('isArchived()', () => {
    (getEntity as jest.Mock).mockReturnValue({
      isArchived: true,
    });
    expect(conversationCardVM.isArchivedGroup).toBe(true);
  });
  describe('showToast()', () => {
    it('should return false if isArchived is false', () => {
      (getEntity as jest.Mock).mockReturnValue({
        isArchived: false,
      });
      expect(conversationCardVM.showToast).toBe(false);
    });
    it('should return true if isArchived is true', () => {
      (getEntity as jest.Mock).mockReturnValue({
        isArchived: true,
      });
      expect(conversationCardVM.showToast).toBe(true);
    });
  });
});
