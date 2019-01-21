/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:37:03
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { JuiIconography } from '..';

storiesOf('Foundation', module)
  .addDecorator(
    withInfoDecorator(JuiIconography, {
      inline: true,
      text:
        'for complete list of icons, visit [jira](https://jira.ringcentral.com/browse/FIJI-2311?filter=-1)',
    }),
  )
  .add('Iconography', () => (
    <div>
      <JuiIconography color="primary">star</JuiIconography>
    </div>
  ));
