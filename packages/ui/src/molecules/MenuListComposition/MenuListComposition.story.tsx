/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-08-22 11:04:21
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../../.storybook/storybook.d.ts" />
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';

import MenuListComposition from '.';

storiesOf('MenuListComposition', module)
  .addWithJSX('MenuListComposition', withInfo(``)(() => {
    return (
      <MenuListComposition />
    );
  }));
