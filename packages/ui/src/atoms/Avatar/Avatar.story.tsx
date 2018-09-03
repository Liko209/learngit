/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-08-17 14:40:24
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../../.storybook/storybook.d.ts" />
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { select } from '@storybook/addon-knobs/react';
import { withInfoDecorator } from '../../utils/decorators';

import Avatar from '.';

import avatar from './img/avatar.jpg';

const knobs = {
  size: () => select(
    'size',
    {
      small: 'small',
      medium: 'medium',
      large: 'large',
    },
    'medium',
  ),
};
storiesOf('Atoms/Avatar', module)
  .addDecorator(withInfoDecorator(Avatar, { inline: true }))
  .addWithJSX('Image', () => {
    return (
      <Avatar size={knobs.size()} src={avatar} />
    );
  })
  .addWithJSX('Name', () => {
    return (
      <Avatar size={knobs.size()}>
        SH
      </Avatar>
    );
  });
