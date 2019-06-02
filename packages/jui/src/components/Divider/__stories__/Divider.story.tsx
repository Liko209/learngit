/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:37:17
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { JuiDivider } from '..';

storiesOf('Components', module).add('Divider', () => (
  <div>
    <h2>test</h2>
    <p>test test test test test</p>
    <JuiDivider />
    <h2>test</h2>
    <p>test test test test test</p>
    <JuiDivider />
    <h2>test</h2>
    <p>test test test test test</p>
    <JuiDivider />
  </div>
));
