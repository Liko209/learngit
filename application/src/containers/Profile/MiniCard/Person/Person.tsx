/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 19:31:28
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import {
  JuiMiniCard,
  JuiMiniCardHeader,
  JuiMiniCardFooter,
} from 'jui/pattern/MiniCard';
import { ProfileMiniCardPersonHeader } from './Header';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { ProfileMiniCardPersonFooter } from './Footer';

type Props = {
  id: number;
};

class ProfileMiniCardPerson extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { id } = this.props;
    const currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
    return (
      <JuiMiniCard>
        <JuiMiniCardHeader emphasize={id === currentUserId}>
          <ProfileMiniCardPersonHeader id={id} />
        </JuiMiniCardHeader>
        <JuiMiniCardFooter>
          <ProfileMiniCardPersonFooter id={id} />
        </JuiMiniCardFooter>
      </JuiMiniCard>
    );
  }
}

export { ProfileMiniCardPerson };
