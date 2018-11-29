/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 17:52:57
 * Copyright © RingCentral. All rights reserved.
 */

import { Profile } from './Profile';
import { MiniCardShowProfileParams } from './types';

class MiniCard {
  static showProfile({ anchor, id }: MiniCardShowProfileParams) {
    Profile.instance.show({ anchor, id });
  }

  static dismissProfile() {
    Profile.instance.dismiss();
  }

  static refreshProfile() {
    Profile.instance.refresh();
  }
}

export { MiniCard };
