/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:35:58
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { number, boolean, select } from '@storybook/addon-knobs';
import { JuiUmi } from '..';

storiesOf('Components/UMI', module).add('Umi', () => (
  <JuiUmi
    unreadCount={number('unreadCount', 10)}
    variant={select(
      'variant',
      {
        count: 'count',
        dot: 'dot',
        auto: 'auto',
      },
      'count',
    )}
    important={boolean('important', false)}
  />
));
