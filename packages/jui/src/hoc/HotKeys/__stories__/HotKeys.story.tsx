/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:10:56
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Fragment, PureComponent } from 'react';
import { storiesOf } from '@storybook/react';
import { boolean } from '@storybook/addon-knobs';
import styled from '../../../foundation/styled-components';
import { HotKeys } from '../';

class Test extends React.Component<{}, {}> {
  onEnter(e, combo) {
    console.log('---enter', e, combo);
  }

  save(e, combo) {
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

storiesOf('HoC/HotKeys', module).add('demo', () => {
  const show = boolean('show', true);
  // if component ummount will unbind all keyboard events
  return show ? (
    <Test />
  ) : (
    <div>if component ummount will unbind all keyboard events</div>
  );
});
