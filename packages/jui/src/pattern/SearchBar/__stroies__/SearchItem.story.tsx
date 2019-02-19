/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-22 09:53:22
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { text, array } from '@storybook/addon-knobs';
import { JuiSearchItem } from '../';
import { JuiAvatar } from '../../../components/Avatar';
import { withInfoDecorator } from '../../../foundation/utils/decorators';

import avatar from './img/avatar.jpg';

const knobs = {
  value: () =>
    text(
      'value',
      'abcdefgabcdefgabcdefgabcdefgabcdefgabcdefgabcdefgabcdefgabcdefgabcdefg',
    ),
  terms: () => array('array', ['a', 'c', 'fg']),
};

storiesOf('Pattern/SearchBar', module)
  .addDecorator(withInfoDecorator(JuiSearchItem, { inline: true }))
  .add('JuiSearchItem', () => {
    return (
      <div>
        <JuiSearchItem
          Avatar={<JuiAvatar src={avatar} size="small" />}
          value={knobs.value()}
          terms={knobs.terms()}
          onClick={() => {}}
        />
        <JuiSearchItem
          Avatar={<JuiAvatar src={avatar} size="small" />}
          onClick={() => {}}
          value={knobs.value()}
          terms={knobs.terms()}
        />
      </div>
    );
  });
