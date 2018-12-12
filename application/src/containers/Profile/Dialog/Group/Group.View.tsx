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
    const { id, dismiss } = this.props;
    return (
      <>
        <JuiDialogTitleWithAction>
          <ProfileDialogGroupTitle id={id} dismiss={dismiss} />
        </JuiDialogTitleWithAction>
        <JuiDialogContentWithFill>
          <ProfileDialogGroupContent id={id} dismiss={dismiss} />
        </JuiDialogContentWithFill>
        <JuiProfileDialogContentMemberShadow />
      </>
    );
  }
}

export { ProfileDialogGroupView };
