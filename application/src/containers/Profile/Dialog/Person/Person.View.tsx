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
import { ProfileDialogPersonTitle } from './Title';
import { ProfileDialogPersonContent } from './Content';
import { ProfileDialogPersonViewProps } from './types';
import { JuiDivider } from 'jui/components/Divider';

@observer
class ProfileDialogPersonView extends Component<ProfileDialogPersonViewProps> {
  componentDidMount() {
    const { refreshPersonData } = this.props;
    refreshPersonData && refreshPersonData();
  }
  render() {
    const { id } = this.props;
    return (
      <>
        <JuiDialogHeader data-test-automation-id="profileDialogTitle">
          <ProfileDialogPersonTitle id={id} />
        </JuiDialogHeader>
        <JuiDivider />
        <JuiDialogContentWithFill data-test-automation-id="profileDialogContent">
          <ProfileDialogPersonContent id={id} />
        </JuiDialogContentWithFill>
      </>
    );
  }
}

export { ProfileDialogPersonView };
