/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-08-20 09:21:46
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../../.storybook/storybook.d.ts" />
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';

import SearchBar from '.';

storiesOf('SearchBar', module)
  .addWithJSX('SearchBar', withInfo(``)(() => {
    return (
      <SearchBar />
    );
  }));
