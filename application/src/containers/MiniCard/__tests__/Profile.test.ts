/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-26 17:26:58
 * Copyright © RingCentral. All rights reserved.
 */

import { Profile } from '../Profile';

describe('Profile mini card', () => {
  it('Profile class is singleton pattern', async () => {
    const profile1 = new Profile();
    const profile2 = new Profile();
    expect(profile1).toEqual(profile2);
  });
});
