/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 14:31:51
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { observer } from 'mobx-react';
import { JuiContainer } from 'jui/pattern/Dialer';
import { DialerContainerViewProps } from './types';
import { Mute } from '../Mute';
import { Keypad } from '../Keypad';
import { Hold } from '../Hold';
import { Add } from '../Add';
import { Record } from '../Record';
import { CallActions } from '../CallActions';
import { End } from '../End';

const KeypadActions = [Mute, Keypad, Hold, Add, Record, CallActions];

@observer
class DialerContainerView extends React.Component<DialerContainerViewProps> {
  render() {
    return <JuiContainer End={End} KeypadActions={KeypadActions} />;
  }
}

export { DialerContainerView };
