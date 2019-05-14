/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-27 14:19:09
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { RuiLinearProgress } from '..';

storiesOf('Progress', module).add('LinearProgress', () => (
  <div>
    <RuiLinearProgress />
    <br />
    <RuiLinearProgress color="secondary" />
  </div>
));
