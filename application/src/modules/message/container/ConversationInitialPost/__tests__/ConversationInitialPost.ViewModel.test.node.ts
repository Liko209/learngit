/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-29 16:15:26
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '@/store/utils';
import { ConversationInitialPostViewModel } from '../ConversationInitialPost.ViewModel';

jest.mock('@/store/utils');
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

const presenceViewModel = new ConversationInitialPostViewModel();

describe('PresenceViewModel', () => {
  it('displayName()', () => {
    (getEntity as jest.Mock).mockReturnValue({ displayName: 'aaa' });
    expect(presenceViewModel.displayName).toBe('aaa');
  });
  it('createTime()', async (done: jest.DoneCallback) => {
    const DATE_2019_1_4 = 1546564919703;
    (getEntity as jest.Mock).mockReturnValue({ createdAt: DATE_2019_1_4 });
    expect(await presenceViewModel.createTime.fetch()).toBe('Fri, 1/4/2019 9:21 AM');
    done();
  });
});
