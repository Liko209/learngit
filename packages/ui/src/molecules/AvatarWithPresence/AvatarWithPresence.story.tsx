/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-08-17 16:27:05
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../../.storybook/storybook.d.ts" />
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { select } from '@storybook/addon-knobs/react';
import { withInfo } from '@storybook/addon-info';

import AvatarWithPresence from '.';

import avatar from '../../atoms/Avatar/img/avatar.jpg';

const knobs = {
  presence: () => select(
    'presence',
    {
      online: 'online',
      offline: 'offline',
      away: 'away',
    },
    'online',
  ),
};

storiesOf('AvatarWithPresence', module)
  .addWithJSX('AvatarWithPresence', withInfo(``)(() => {
    return (
      <AvatarWithPresence src={avatar} presence={knobs.presence()} />
    );
  }));
