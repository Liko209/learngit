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
  describe('createTime()', () => {
    const dateNow = 1546564919703;
    moment().date(dateNow); // 2018/1/4 9:21 AM
    it('should be time format when createdAt in today [JPT-701]', () => {
      (getEntity as jest.Mock).mockReturnValue({
        createdAt: dateNow,
        creatorId: 107913219,
      });
      expect(conversationCardVM.createTime).toBe('9:21 AM');
    });
    it('should be weekdayAndTime format when createdAt diff >= 1 && < 7 [JPT-701]', () => {
      (getEntity as jest.Mock).mockReturnValue({
        createdAt: dateNow - 24 * 60 * 60 * 1000,
        creatorId: 107913219,
      });
      expect(conversationCardVM.createTime).toBe('Fri, 9:21 AM');
    });
    it('should be dateAndTime format when createdAt diff > 7 || < 0 [JPT-701]', () => {
      (getEntity as jest.Mock).mockReturnValue({
        createdAt: dateNow + 24 * 60 * 60 * 1000,
        creatorId: 107913219,
      });
      expect(conversationCardVM.createTime).toBe('Sun, 1/5/2019 9:21 AM');
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
