/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-23 13:57:46
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean } from '@storybook/addon-knobs';
import { HotKeys } from '../';

class Test extends React.PureComponent<{}, {}> {
  onEnter(e: any, combo: any) {
    console.log('---enter', e, combo);
  }

  save(e: any, combo: any) {
    console.log('command + s', e, combo);
    return false; // same as jquery event return false
  }

  render() {
    return (
      <HotKeys
        keyMap={{
          esc: this.onEnter,
          'mod+s': this.save,
        }}
      >
        {({ unbind, reset }) => {
          return (
            <ul>
              <li onClick={reset} className="li">
                1
              </li>
              <li onClick={() => unbind('esc')} className="li">
                2
              </li>
            </ul>
          );
        }}
      </HotKeys>
    );
  }
}

class Test1 extends React.PureComponent<{}, {}> {
  onEsc(e: any, combo: any) {
    console.log('---Test1 onEsc', e, combo);
  }

  save = async (e: any, combo: any) => {
    console.log('-----Test1 command + s', e, combo);
    return false; // same as jquery event return false
  }

  render() {
    return (
      <HotKeys
        keyMap={{
          esc: {
            handler: this.onEsc,
            action: 'keyup',
          },
          'mod+s': this.save,
        }}
      >
        <li className="li">111111</li>
        <li className="li">2222222</li>
      </HotKeys>
    );
  }
}

storiesOf('HoC/HotKeys', module).add('demo', () => {
  const show = boolean('show', true);
  return (
    <div>
      if component ummount will unbind all keyboard events
      {show ? <Test1 /> : null}
      <Test />
    </div>
  );
});
