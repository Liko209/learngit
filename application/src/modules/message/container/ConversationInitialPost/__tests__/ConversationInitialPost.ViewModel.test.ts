/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-29 16:15:26
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '../../../../../store/utils';
import { ConversationInitialPostViewModel } from '../ConversationInitialPost.ViewModel';
jest.mock('../../../store/utils');

const presenceViewModel = new ConversationInitialPostViewModel();

describe('PresenceViewModel', () => {
  it('displayName()', () => {
    (getEntity as jest.Mock).mockReturnValue({ displayName: 'aaa' });
    expect(presenceViewModel.displayName).toBe('aaa');
  });
});
