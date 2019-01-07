/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import {
  JuiDialogTitleWithAction,
  JuiDialogContentWithFill,
} from 'jui/components/Dialog';
import { ProfileDialogGroupTitle } from './Title';
import { ProfileDialogGroupContent } from './Content';
import { JuiProfileDialogContentMemberShadow } from 'jui/pattern/Profile/Dialog';
import { ProfileDialogGroupViewProps } from './types';

@observer
class ProfileDialogGroupView extends Component<ProfileDialogGroupViewProps> {
  render() {
    const { id } = this.props;
    return (
      <>
        <JuiDialogTitleWithAction data-test-automation-id="profileDialogTitle">
          <ProfileDialogGroupTitle id={id} />
        </JuiDialogTitleWithAction>
        <JuiDialogContentWithFill data-test-automation-id="profileDialogContent">
          <ProfileDialogGroupContent id={id} />
        </JuiDialogContentWithFill>
        <JuiProfileDialogContentMemberShadow />
      </>
    );
  }
}

export { ProfileDialogGroupView };
