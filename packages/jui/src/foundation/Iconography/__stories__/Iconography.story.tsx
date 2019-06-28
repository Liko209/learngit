/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:37:03
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { JuiIconography } from '..';
import star from '../../../assets/jupiter-icon/icon-star.svg';

storiesOf('Foundation', module).add('Iconography', () => (
  <div>
    <JuiIconography iconColor={['primary', '500']} symbol={star} desc={'ha'} />
  </div>
));
