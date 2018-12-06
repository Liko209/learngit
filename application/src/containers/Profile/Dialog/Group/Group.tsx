/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 19:31:28
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
// import {
//   JuiProfileDialogTitle,
//   JuiProfileDialogContent,
// } from 'jui/pattern/Profile/Dialog';
import {
  JuiDialogTitleWithAction,
  JuiDialogContentWithFill,
} from 'jui/components/Dialog';
import { ProfileDialogGroupTitle } from './Title';
import { ProfileDialogGroupContent } from './Content';

type Props = {
  id: number;
  dismiss: () => void;
};

class ProfileDialogGroup extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

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
      </>
    );
  }
}

export { ProfileDialogGroup };
