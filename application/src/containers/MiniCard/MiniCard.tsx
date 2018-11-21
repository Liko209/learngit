/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 17:52:57
 * Copyright © RingCentral. All rights reserved.
 */

import { Profile } from './Profile';

class MiniCard {
  static showProfile(id: number) {
    Profile.instance.show(id);
  }

  static destroyProfile() {
    Profile.instance.destroy();
  }
}

export { MiniCard };
