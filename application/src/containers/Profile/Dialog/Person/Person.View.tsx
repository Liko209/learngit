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
import { ProfileDialogPersonTitle } from './Title';
import { ProfileDialogPersonContent } from './Content';
import { ProfileDialogPersonViewProps } from './types';

@observer
class ProfileDialogPersonView extends Component<ProfileDialogPersonViewProps> {
  render() {
    const { id, dismiss } = this.props;
    return (
      <>
        <JuiDialogTitleWithAction data-test-automation-id="profileDialogTitle">
          <ProfileDialogPersonTitle id={id} dismiss={dismiss} />
        </JuiDialogTitleWithAction>
        <JuiDialogContentWithFill data-test-automation-id="profileDialogContent">
          <ProfileDialogPersonContent id={id} dismiss={dismiss} />
        </JuiDialogContentWithFill>
      </>
    );
  }
}

export { ProfileDialogPersonView };
