/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-23 15:33:02
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity, getGlobalValue } from '../../../store/utils';
import { ConversationCardViewModel } from '../ConversationCard.ViewModel';

jest.mock('../../../store/utils');

const conversationCardVM = new ConversationCardViewModel();
describe('ConversationCardViewModel', () => {
  beforeAll(() => {
    jest.resetAllMocks();
    conversationCardVM.onReceiveProps({ id: 123 });
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
  it('atMentionIdMaps()', () => {
    (getEntity as jest.Mock).mockReturnValue({
      atMentionNonItemIds: [1234],
      displayName: 'alvin huang',
    });
    expect(conversationCardVM.atMentionIdMaps).toMatchObject({
      1234: 'alvin huang',
    });
  });
  it('currentUserId()', () => {
    (getGlobalValue as jest.Mock).mockReturnValue(123456);
    expect(conversationCardVM.currentUserId).toBe(123456);
  });
  it('createTime()', () => {
    (getEntity as jest.Mock).mockReturnValue({
      createdAt: 1540279718268,
      creatorId: 107913219,
    });
    expect(conversationCardVM.createTime).toBe('03:28 PM');
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
    expect(conversationCardVM.name).toBe('alvin');
  });
});
