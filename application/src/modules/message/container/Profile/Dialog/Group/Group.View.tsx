/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import {
  JuiDialogContentWithFill,
  JuiDialogHeader,
} from 'jui/components/Dialog';
import { JuiDivider } from 'jui/components/Divider';
import { ProfileDialogGroupTitle } from './Title';
import { ProfileDialogGroupContent } from './Content';
import { JuiProfileDialogContentMemberShadow } from 'jui/pattern/Profile/Dialog';
import { ProfileDialogGroupViewProps, ProfileContext } from './types';
import { JuiSizeManager } from 'jui/components/SizeDetector';
import { PROFILE_FIX_HEIGHT } from './Content/Members/constants';

@observer
class ProfileDialogGroupView extends Component<ProfileDialogGroupViewProps> {
  state = { showEmpty: false };
  private _sizeManager: JuiSizeManager;
  constructor(props: ProfileDialogGroupViewProps) {
    super(props);

    this._sizeManager = new JuiSizeManager();
    this._sizeManager.addConstantSize('constant', {
      height: PROFILE_FIX_HEIGHT,
      width: 0,
    });
    this._sizeManager.addResizeCallback(this._didResize);
  }
  private _didResize = () => {
    this.forceUpdate();
  }
  setShowEmpty = (flag: boolean) => {
    this.setState({ showEmpty: flag });
  }
  componentWillUnmount() {
    this._sizeManager.removeAllCallback();
    delete this._sizeManager;
  }
  render() {
    const { id, group } = this.props;
    const { showEmpty } = this.state;
    return (
      <ProfileContext.Provider
        value={{
          showEmpty,
          sizeManager: this._sizeManager,
          setShowEmpty: this.setShowEmpty,
        }}
      >
        <JuiDialogHeader
          data-profile-type={group.isTeam ? 'team' : 'group'}
          data-test-automation-id="profileDialogTitle"
        >
          <ProfileDialogGroupTitle id={id} />
        </JuiDialogHeader>
        <JuiDivider />
        <JuiDialogContentWithFill
          noPaddingFix={true}
          data-test-automation-id="profileDialogContent"
        >
          <ProfileDialogGroupContent id={id} />
        </JuiDialogContentWithFill>
        {!showEmpty && <JuiProfileDialogContentMemberShadow />}
      </ProfileContext.Provider>
    );
  }
}

export { ProfileDialogGroupView };
