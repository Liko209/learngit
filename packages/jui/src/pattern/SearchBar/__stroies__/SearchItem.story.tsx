/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-22 09:53:22
 * Copyright © RingCentral. All rights reserved.
 */
/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-30 14:45:02
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { text, array } from '@storybook/addon-knobs';
import { JuiSearchItem } from '../';
import { JuiAvatar } from '../../../components/Avatar';
import { JuiIconography } from '../../../foundation/Iconography';
import { withInfoDecorator } from '../../../foundation/utils/decorators';

import avatar from './img/avatar.jpg';
const value = text(
  'value',
  'abcdefgabcdefgabcdefgabcdefgabcdefgabcdefgabcdefgabcdefgabcdefgabcdefg',
);
const terms = array('array', ['a', 'c', 'fg']);

storiesOf('Pattern/SearchBar', module)
  .addDecorator(withInfoDecorator(JuiSearchItem, { inline: true }))
  .add('JuiSearchItem', () => {
    return (
      <div>
        <JuiSearchItem
          avatar={<JuiAvatar src={avatar} size="small" />}
          value={value}
          terms={terms}
          actions={[
            <JuiIconography key="call" style={{ display: 'flex' }}>
              call
            </JuiIconography>,
            <JuiIconography key="call" style={{ display: 'flex' }}>
              videocam
            </JuiIconography>,
          ]}
        />
        <JuiSearchItem
          avatar={<JuiAvatar src={avatar} size="small" />}
          value={value}
          terms={terms}
          actions={[
            <JuiIconography key="call" style={{ display: 'flex' }}>
              videocam
            </JuiIconography>,
          ]}
        />
      </div>
    );
  });
