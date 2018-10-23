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
  it('get computed post', () => {
    (getEntity as jest.Mock).mockReturnValue({
      atMentionNonItemIds: [1234],
      text: 'abcd  efg',
    });
    expect(conversationCardVM.post).toMatchObject({
      atMentionNonItemIds: [1234],
      text: 'abcd  efg',
    });
  });
  it('get kv value', () => {
    (getEntity as jest.Mock).mockReturnValue({
      atMentionNonItemIds: [1234],
      text: 'abcd  efg',
      displayName: 'alvin huang',
    });
    expect(conversationCardVM.kv).toMatchObject({
      1234: 'alvin huang',
    });
  });
  it('get currentUserId', () => {
    (getGlobalValue as jest.Mock).mockReturnValue(123456);
    expect(conversationCardVM.currentUserId).toBe(123456);
  });
  it('get createTime', () => {
    (getEntity as jest.Mock).mockReturnValue({
      createdAt: 1540279718268,
      creatorId: 107913219,
    });
    expect(conversationCardVM.createTime).toBe('03:28 PM');
  });
  it('get creator', () => {
    (getEntity as jest.Mock).mockReturnValue({
      createdAt: 1540279718268,
      creatorId: 107913219,
      id: 1491222532,
    });
    expect(conversationCardVM.creator).toMatchObject({
      id: 1491222532,
    });
  });
  it('should return title if displayName exist', () => {
    (getEntity as jest.Mock).mockReturnValue({
      createdAt: 1540279718268,
      creatorId: 107913219,
      displayName: 'alvin',
      id: 1491222532,
      status: 'online',
    });
    expect(conversationCardVM.displayTitle).toBe('alvin');
  });
});
