/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import {
  JuiMiniCard,
  JuiMiniCardHeader,
  JuiMiniCardFooter,
} from 'jui/pattern/MiniCard';
import { ProfileMiniCardPersonViewProps } from './types';
import { ProfileMiniCardPersonHeader } from './Header';
import { ProfileMiniCardPersonFooter } from './Footer';

@observer
class ProfileMiniCardPersonView extends Component<
  ProfileMiniCardPersonViewProps
> {
  render() {
    const { id, isMe } = this.props;
    return (
      <JuiMiniCard>
        <JuiMiniCardHeader emphasize={isMe}>
          <ProfileMiniCardPersonHeader id={id} />
        </JuiMiniCardHeader>
        <JuiMiniCardFooter>
          <ProfileMiniCardPersonFooter id={id} />
        </JuiMiniCardFooter>
      </JuiMiniCard>
    );
  }
}

export { ProfileMiniCardPersonView };
