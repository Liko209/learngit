/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 17:52:57
 * Copyright © RingCentral. All rights reserved.
 */

import { ProfileMiniCard } from './Profile';
import { MiniCardShowProfileParams } from './types';

class MiniCard {
  static showProfile({ anchor, id }: MiniCardShowProfileParams) {
    ProfileMiniCard.instance.show({ anchor, id });
  }

  static dismissProfile() {
    ProfileMiniCard.instance.dismiss();
  }

  static refreshProfile() {
    ProfileMiniCard.instance.refresh();
  }
}

export { MiniCard };
