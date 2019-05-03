/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-22 13:36:24
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import { ViewProps } from './types';
import { JuiMinimizedCall, JuiDialpadBtn } from 'jui/pattern/Dialer';
import { Mute } from '../Mute';
import { End } from '../End';

type DialpadProps = ViewProps;

const Actions = [() => <Mute type="fab" />, () => <End size="medium" />];

class DialpadView extends React.Component<DialpadProps> {
  render() {
    const { showMinimized, maximize } = this.props;
    return showMinimized ? (
      <JuiMinimizedCall
        onClick={maximize}
        Actions={Actions}
        name="112233112233112233112233"
        label="112233"
        data-test-automation-id="telephony-minimized-view"
      />
    ) : (
      <JuiDialpadBtn
        size="medium"
        iconName="keypad"
        disableRipple={true}
        data-test-automation-id="telephony-dialpad-btn"
      />
    );
  }
}

export { DialpadView };
