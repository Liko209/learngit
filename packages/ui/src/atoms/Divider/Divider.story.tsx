/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:37:17
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { Divider } from '.';
import { withInfoDecorator } from '../../utils/decorators';

storiesOf('Atoms/Divider 🔜', module)
  .addDecorator(withInfoDecorator(Divider, { inline: true }))
  .add('default', () => (
    <div>
      <h2>test</h2>
      <p>test test test test test</p>
      <Divider />
      <h2>test</h2>
      <p>test test test test test</p>
      <Divider />
      <h2>test</h2>
      <p>test test test test test</p>
      <Divider />
    </div>
  ));
