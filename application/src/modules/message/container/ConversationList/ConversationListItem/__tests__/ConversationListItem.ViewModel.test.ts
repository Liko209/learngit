/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-10-16 10:45:21
 * Copyright © RingCentral. All rights reserved.
 */
import { ConversationListItemViewModel } from '../ConversationListItem.ViewModel';
import storeManager from '@/store/base/StoreManager';
import { GLOBAL_KEYS } from '@/store/constants';

jest.mock('sdk/dao');
jest.mock('sdk/api');

const model = new ConversationListItemViewModel();
describe('ConversationListItemViewModel', () => {
  it('should not be selected by default', () => {
    model.props.groupId = 1;
    expect(model.selected).toBe(false);
  });

  it('should be selected if this conversation item id is current opened group id', () => {
    model.props.groupId = 1;
    storeManager.getGlobalStore = jest.fn().mockReturnValue({
      get: jest.fn((key: string) => {
        if (key === GLOBAL_KEYS.CURRENT_CONVERSATION_ID) {
          return 1;
        }
        return null;
      }),
    });
    expect(model.selected).toBe(true);
  });
});
