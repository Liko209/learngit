/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-26 17:26:58
 * Copyright © RingCentral. All rights reserved.
 */

import { ProfileMiniCard } from '../Profile';

describe('Profile mini card', () => {
  it('Profile class is singleton pattern', async () => {
    const profile1 = new ProfileMiniCard();
    const profile2 = new ProfileMiniCard();
    expect(profile1).toEqual(profile2);
  });
});
