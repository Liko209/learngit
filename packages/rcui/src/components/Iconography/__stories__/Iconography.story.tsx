/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-03-11 11:24:01
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { RuiIconography } from '..';

storiesOf('Icon', module).add('Iconography', () => (
  <div>
    <RuiIconography iconColor={['primary', 'main']} icon="star" />
  </div>
));
