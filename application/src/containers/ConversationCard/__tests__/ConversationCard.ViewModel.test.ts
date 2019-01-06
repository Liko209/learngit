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

const DAY = 24 * 3600 * 1000;
const DATE_2019_1_4 = 1546564919703;
const DATE_2019_1_3 = 1546564919703 - DAY;
const DATE_2019_1_5 = 1546564919703 + DAY;
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
    it('should be timeAndDate format when mode is navigation [JPT-705]', () => {
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      conversationCardVM.props.mode = 'navigation';
      (getEntity as jest.Mock).mockReturnValue({
        createdAt: DATE_2019_1_4,
        creatorId: 107913219,
      });
      expect(conversationCardVM.createTime).toBe('Fri, 1/4/2019 9:21 AM');
      conversationCardVM.props.mode = undefined;
    });
    it('should be time format when createdAt is 2019/1/4 [JPT-701]', () => {
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      (getEntity as jest.Mock).mockReturnValue({
        createdAt: DATE_2019_1_4,
        creatorId: 107913219,
      });
      expect(conversationCardVM.createTime).toBe('9:21 AM');
    });
    it('should be weekdayAndTime format when createdAt is 2019/1/3 [JPT-701]', () => {
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      (getEntity as jest.Mock).mockReturnValue({
        createdAt: DATE_2019_1_3,
        creatorId: 107913219,
      });
      expect(conversationCardVM.createTime).toBe('Thu, 9:21 AM');
    });
    it('should be dateAndTime format when createdAt is 2019/1/5 [JPT-701]', () => {
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      (getEntity as jest.Mock).mockReturnValue({
        createdAt: DATE_2019_1_5,
        creatorId: 107913219,
      });
      expect(conversationCardVM.createTime).toBe('Sat, 1/5/2019 9:21 AM');
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
