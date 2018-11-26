/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-26 17:25:35
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '../../../store/utils';
// import { JumpToConversationViewModel } from '../JumpToConversation.ViewModel';
// import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';

jest.mock('../../../store/utils');

const mockData = {
  attachmentIds: [123],
};

// const jumpToConversationViewModel = new JumpToConversationViewModel({ id: 1 });

describe('jumpToConversationViewModel', () => {
  beforeAll(() => {
    (getEntity as jest.Mock).mockReturnValue(mockData);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getConversationId()', () => {
    // expect(jumpToConversationViewModel.getConversationId).toEqual([123]);
  });
});
