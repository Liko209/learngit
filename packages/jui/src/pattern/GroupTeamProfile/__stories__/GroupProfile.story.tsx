/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 13:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import defaultGroupAvatar from '../static/Groups.png';

const avatar = <img src={defaultGroupAvatar} alt=""/>;
import {
  JuiGroupProfileHeader,
  JuiGroupProfileBody,
} from '..';
const desc =
  'It is a great teamIt is a great teamIt is a great teamIt ' +
  'is a great teamIt is a great It is a great teamIt is a great teamIt ' +
  'is a great teamIt is a great teamIt is a great teamIt is.It is a great ' +
  'teamIt is a great teamIt is a great teamIt is a great teamIt is a great ' +
  'It is a great teamIt is a great teamIt is a great teamIt is a great teamIt is a great teamIt is.';
storiesOf('Pattern', module)
  .addDecorator(withInfoDecorator(JuiGroupProfileHeader, { inline: true }))
  .add('GroupProfile', () => {
    return (
      <>
        <JuiGroupProfileHeader title="Profile" dismiss={() => {}} />
        <JuiGroupProfileBody
          displayName="Jupiter Design team"
          description={desc}
          avatar={avatar}
        />
      </>
    );
  });
