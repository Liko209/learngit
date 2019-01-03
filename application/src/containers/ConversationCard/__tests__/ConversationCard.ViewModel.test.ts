/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-23 15:33:02
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '../../../store/utils';
import { ConversationCardViewModel } from '../ConversationCard.ViewModel';
import moment from 'moment';

jest.mock('i18next', () => ({
  t: (text: string) => text,
}));

jest.mock('../../../store/utils');

const WEEKDAY = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const conversationCardVM = new ConversationCardViewModel();
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
  describe('createTime() The time format for Conversation. JPT-701', () => {
    it('should toBe time format when createdAt in today', () => {
      (getEntity as jest.Mock).mockReturnValue({
        createdAt: Date.now(),
        creatorId: 107913219,
      });
      expect(conversationCardVM.createTime).toBe(
        moment(conversationCardVM.post.createdAt).format('LT'),
      );
    });
    it('should toBe weekdayAndTime format when createdAt diff >= 1 && < 7', () => {
      (getEntity as jest.Mock).mockReturnValue({
        createdAt: Date.now() - 24 * 60 * 60 * 1000,
        creatorId: 107913219,
      });
      const dateMoment = moment(conversationCardVM.post.createdAt);
      const days = new Date(conversationCardVM.post.createdAt).getDay();
      expect(conversationCardVM.createTime).toBe(
        `${WEEKDAY[days].slice(0, 3)}, ${dateMoment.format('LT')}`,
      );
    });
    it('should toBe dateAndTime format when createdAt diff > 7 || < 0', () => {
      (getEntity as jest.Mock).mockReturnValue({
        createdAt: Date.now() + 24 * 60 * 60 * 1000,
        creatorId: 107913219,
      });

      const dateMoment = moment(conversationCardVM.post.createdAt);
      const days = new Date(conversationCardVM.post.createdAt).getDay();
      expect(conversationCardVM.createTime).toBe(
        `${WEEKDAY[days].slice(0, 3)}, ${dateMoment.format(
          'l',
        )} ${dateMoment.format('LT')}`,
      );
    });
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
});
