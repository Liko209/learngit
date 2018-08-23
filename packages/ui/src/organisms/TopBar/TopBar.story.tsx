/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-08-21 10:31:21
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../../.storybook/storybook.d.ts" />
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';

import TopBar from '.';

import avatar from '../../atoms/Avatar/img/avatar.jpg';

storiesOf('TopBar', module)
  .addWithJSX('TopBar', withInfo(``)(() => {
    return (
      <TopBar avatar={avatar} presence="online" />
    );
  }));
