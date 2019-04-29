/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 14:31:51
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { observer } from 'mobx-react';
import { JuiContainer } from 'jui/pattern/Dialer';
import { JuiIconButton } from 'jui/components/Buttons';
import _ from 'lodash';
import { DialerContainerViewProps } from './types';
import { Mute } from '../Mute';
import { Keypad } from '../Keypad';
import { Hold } from '../Hold';
import { Add } from '../Add';
import { Record } from '../Record';
import { CallActions } from '../CallActions';
import { End } from '../End';

const KEYPAD_ACTIONS = [Mute, Keypad, Hold, Add, Record, CallActions];
const KEY_2_ICON_MAP = {
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
const ACCEPTABLE_KEYS = Object.values(KEY_2_ICON_MAP);
const KEY_UP = 'keyup';

const throttledHandler = (f: any) =>
  _.throttle(f, 30, {
    trailing: true,
    leading: false,
  });

@observer
class DialerContainerView extends React.Component<DialerContainerViewProps> {
  private _keypadKeys: React.ComponentType[];
  private _onKeyup: (e: KeyboardEvent) => void;

  constructor(props: DialerContainerViewProps) {
    super(props);

    this._onKeyup = throttledHandler(({ key }: KeyboardEvent) => {
      const { keypadEntered, dtmf } = this.props;
      if (ACCEPTABLE_KEYS.includes(key) && keypadEntered) {
        dtmf(key);
      }
    });

    // Since we know that the dtmf() method for a view-model instance won't change during the runtime, then we can cache the buttons
    this._keypadKeys = [
      'one',
      'two',
      'three',
      'four',
      'five',
      'six',
      'seven',
      'eight',
      'nine',
      'asterisk',
      'zero',
      'hash',
    ].map((str) => {
      const res = () => (
        <JuiIconButton
          disableToolTip={true}
          disableRipple={true}
          onClick={throttledHandler(() => props.dtmf(KEY_2_ICON_MAP[str]))}
          size="xxlarge"
          key={str}
          color="grey.900"
          stretchIcon={true}
        >
          {str}
        </JuiIconButton>
      );
      res.displayName = str;
      return res;
    });
  }

  componentDidMount() {
    window.addEventListener(KEY_UP, this._onKeyup);
  }

  componentWillUnmount() {
    window.removeEventListener(KEY_UP, this._onKeyup);
  }

  render() {
    return (
      <JuiContainer
        End={End}
        KeypadActions={
          this.props.keypadEntered ? this._keypadKeys : KEYPAD_ACTIONS
        }
      />
    );
  }
}

export { DialerContainerView };
