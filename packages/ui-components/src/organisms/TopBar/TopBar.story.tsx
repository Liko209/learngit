/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-08-21 10:31:21
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../../.storybook/storybook.d.ts" />
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../utils/decorators';

import TopBar from '.';

import avatar from '../../atoms/Avatar/__stories__/img/avatar.jpg';

storiesOf('Organisms/TopBar', module)
  .addDecorator(withInfoDecorator(TopBar, { inline: true }))
  .addWithJSX('TopBar', () => {
    return (
      <TopBar avatar={avatar} presence="online" />
    );
  });
