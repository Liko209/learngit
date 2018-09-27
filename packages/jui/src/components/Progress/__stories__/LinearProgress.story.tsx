/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-27 14:19:09
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { JuiLinearProgress } from '..';

storiesOf('Components/Progress', module)
  .addDecorator(withInfoDecorator(JuiLinearProgress, { inline: true }))
  .add('LinearProgress', () => (
    <div>
      <JuiLinearProgress />
      <br />
      <JuiLinearProgress color="secondary" />
    </div>
  ));
