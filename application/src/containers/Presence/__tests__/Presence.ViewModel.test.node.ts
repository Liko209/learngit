/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-16 16:06:38
 * Copyright © RingCentral. All rights reserved.
 */
import { getPresence } from '../../../store/utils';
import { PresenceViewModel } from '../Presence.ViewModel';

jest.mock('../../../store/utils');

const presenceViewModel = new PresenceViewModel();

describe('PresenceViewModel', () => {
  it('presence()', () => {
    (getPresence as jest.Mock).mockReturnValue('Available');
    expect(presenceViewModel.presence).toBe('Available');
  });
});
