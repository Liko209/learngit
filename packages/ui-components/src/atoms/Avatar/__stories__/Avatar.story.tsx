/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-08-17 14:40:24
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../../../.storybook/storybook.d.ts" />
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { select } from '@storybook/addon-knobs/react';
import { withInfoDecorator } from '../../../utils/decorators';

import JuiAvatar from '..';

import avatar from './img/avatar.jpg';

const knobs = {
  size: () =>
    select(
      'size',
      {
        small: 'small',
        medium: 'medium',
        large: 'large',
        xlarge: 'xlarge',
      },
      'medium',
    ),

  color: () =>
    select(
      'color',
      {
        lake: 'lake',
        tiffany: 'tiffany',
        cateye: 'cateye',
        grass: 'grass',
        gold: 'gold',
        persimmon: 'persimmon',
        tomato: 'tomato',
      },
      'lake',
    ),
};
storiesOf('Atoms/Avatar', module)
  .addDecorator(withInfoDecorator(JuiAvatar, { inline: true }))
  .addWithJSX('Image', () => {
    return <JuiAvatar size={knobs.size()} src={avatar} />;
  })
  .addWithJSX('Name', () => {
    return (
      <JuiAvatar size={knobs.size()} color={knobs.color()}>
        SH
      </JuiAvatar>
    );
  });
