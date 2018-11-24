/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 13:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { GROUP_TYPES } from '../types';
// import defaultGroupAvatar from '../static/Groups';

import {
  JuiGroupProfileHeader,
  JuiGroupProfileBody,
  JuiGroupProfileList,
} from '..';
const desc =
  'It is a great teamIt is a great teamIt is a great teamIt ' +
  'is a great teamIt is a great It is a great teamIt is a great teamIt ' +
  'is a great teamIt is a great teamIt is a great teamIt is.It is a great ' +
  'teamIt is a great teamIt is a great teamIt is a great teamIt is a great ' +
  'It is a great teamIt is a great teamIt is a great teamIt is a great teamIt is a great teamIt is.';
const membersList = [
  { name: 'sssss1' },
  { name: 'sssss2' },
  { name: 'sssss3' },
  { name: 'sssss4' },
  { name: 'sssss5' },
  { name: 'sssss6' },
  { name: 'sssss7' },
  { name: 'sssss8' },
  { name: 'sssss9' },
  { name: 'sssss' },
  { name: 'sssss' },
  { name: 'sssss' },
  { name: 'sssss' },
  { name: 'sssss' },
  { name: 'sssss' },
  { name: 'sssss' },
  { name: 'sssss' },
  { name: 'sssss' },
  { name: 'sssss' },
  { name: 'sssss' },
];
storiesOf('Pattern', module)
  .addDecorator(withInfoDecorator(JuiGroupProfileHeader, { inline: true }))
  .add('GroupProfile', () => {
    return (
      <>
        <JuiGroupProfileHeader text="Profile" />
        <JuiGroupProfileBody
          type={GROUP_TYPES.TEAM}
          displayName="Jupiter Design team"
          description={desc}
        />
        <JuiGroupProfileList
          counts={10}
          type={GROUP_TYPES.TEAM}
          membersList={membersList}
        />
      </>
    );
  });
