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
import { JuiIconButton } from 'jui/components/Buttons';

const KeypadActions = [Mute, Keypad, Hold, Add, Record, CallActions];
const Key2IconMap = {
  one: '1',
  two: '2',
  three: '3',
  four: '4',
  five: '5',
  six: '6',
  seven: '7',
  eight: '8',
  nine: '9',
  asterisk: '*',
  zero: '0',
  hash: '#',
};

@observer
class DialerContainerView extends React.Component<DialerContainerViewProps> {
  render() {
    const DialerButtons = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'asterisk', 'zero', 'hash',
    ].map(
      str => () => (
        <JuiIconButton
          disableToolTip={true}
          onClick={() => this.props.dtmf(Key2IconMap[str])}
          size="xxlarge"
          key={str}
          color="grey.900"
          variant="plain"
        >
          {str}
        </JuiIconButton>
      ));

    return <JuiContainer End={End} KeypadActions={this.props.keypadEntered ? DialerButtons : KeypadActions} />;
  }
}

export { DialerContainerView };
