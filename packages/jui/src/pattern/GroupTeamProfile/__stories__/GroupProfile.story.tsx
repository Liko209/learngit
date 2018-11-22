/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 13:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { GROUP_BODY_TYPES } from '../types';

import { JuiGroupProfileHeader, JuiGroupProfileBody } from '..';
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
        <JuiGroupProfileHeader text="Profile" />
        <JuiGroupProfileBody
          type={GROUP_BODY_TYPES.TEAM}
          displayName="Jupiter Design team"
          description={desc}
        />
      </>
    );
  });
