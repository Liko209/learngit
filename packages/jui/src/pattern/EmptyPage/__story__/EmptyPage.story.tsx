/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-06-24 10:00:00
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { JuiEmptyPage } from '../EmptyPage';
import emptyPageImage from './empty.svg';

const Decorator = (storyFn: any) => (
  <div style={{ width: '720px', height: '540px', background: '#fff' }}>
    {storyFn()}
  </div>
);

storiesOf('Pattern', module)
  .addDecorator(Decorator)
  .add('EmptyPage', () => (
    <JuiEmptyPage message="Nothing here." image={emptyPageImage} />
  ));
