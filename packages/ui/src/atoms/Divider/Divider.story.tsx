/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:37:17
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Fragment } from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { Divider } from '.';

storiesOf('Atoms/Divider', module)
  .add('default', withInfo(``)(() => (
    <Fragment>
      <h2>test</h2>
      <p>test test test test test</p>
      <Divider />
      <h2>test</h2>
      <p>test test test test test</p>
      <Divider />
      <h2>test</h2>
      <p>test test test test test</p>
      <Divider />
    </Fragment>
  )));
