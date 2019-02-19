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
import portalManager from '@/common/PortalManager';

@observer
class ProfileMiniCardGroupView extends Component<
  ProfileMiniCardGroupViewProps
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
    const { id, group } = this.props;
    return group.displayName ? (
      <JuiMiniCard
        data-test-automation-id="profileMiniCard"
        onBlur={this.onBlurHandler}
        onFocus={this.onFocusHandler}
      >
        <JuiMiniCardHeader data-test-automation-id="profileMiniCardHeader">
          <ProfileMiniCardGroupHeader id={id} />
        </JuiMiniCardHeader>
        <JuiMiniCardFooter data-test-automation-id="profileMiniCardFooter">
          <ProfileMiniCardGroupFooter id={id} />
        </JuiMiniCardFooter>
      </JuiMiniCard>
    ) : null;
  }
}

export { ProfileMiniCardGroupView };
