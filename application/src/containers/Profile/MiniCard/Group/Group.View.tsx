/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { ProfileMiniCardGroupViewProps } from './types';
import {
  JuiMiniCard,
  JuiMiniCardHeader,
  JuiMiniCardFooter,
} from 'jui/pattern/MiniCard';
import { ProfileMiniCardGroupHeader } from './Header';
import { ProfileMiniCardGroupFooter } from './Footer';

@observer
class ProfileMiniCardGroupView extends Component<
  ProfileMiniCardGroupViewProps
> {
  render() {
    const { id } = this.props;
    return (
      <JuiMiniCard>
        <JuiMiniCardHeader>
          <ProfileMiniCardGroupHeader id={id} />
        </JuiMiniCardHeader>
        <JuiMiniCardFooter>
          <ProfileMiniCardGroupFooter id={id} />
        </JuiMiniCardFooter>
      </JuiMiniCard>
    );
  }
}

export { ProfileMiniCardGroupView };
