/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:35:58
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { number, boolean, select } from '@storybook/addon-knobs/react';
import { Umi } from '..';

storiesOf('Atoms/Umi 🔜', module)
  .add('with knobs', withInfo({ inline: true })(
    () => {
      return (
        <Umi
          unreadCount={number('unreadCount', 10)}
          variant={select('variant', {
            count: 'count',
            dot: 'dot',
            auto: 'auto',
          },              'count')}
          important={boolean('important', false)}
        />
      );
    },
  ));
