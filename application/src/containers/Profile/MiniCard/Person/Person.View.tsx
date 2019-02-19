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
import portalManager from '@/common/PortalManager';

@observer
class ProfileMiniCardPersonView extends Component<
  ProfileMiniCardPersonViewProps
> {
  private _timer: number;

  onBlurHandler = () => {
    this._timer = setTimeout(() => {
      portalManager.dismissLast();
    });
  }

  onFocusHandler = () => {
    clearTimeout(this._timer);
  }

  render() {
    const { id, isMe } = this.props;
    return (
      <JuiMiniCard
        data-test-automation-id="profileMiniCard"
        onBlur={this.onBlurHandler}
        onFocus={this.onFocusHandler}
      >
        <JuiMiniCardHeader
          emphasize={isMe}
          data-test-automation-id="profileMiniCardHeader"
        >
          <ProfileMiniCardPersonHeader id={id} />
        </JuiMiniCardHeader>
        <JuiMiniCardFooter data-test-automation-id="profileMiniCardFooter">
          <ProfileMiniCardPersonFooter id={id} />
        </JuiMiniCardFooter>
      </JuiMiniCard>
    );
  }
}

export { ProfileMiniCardPersonView };
