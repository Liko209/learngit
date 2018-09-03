/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-08-20 09:21:46
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../../.storybook/storybook.d.ts" />
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../utils/decorators';

import SearchBar from '.';

storiesOf('Molecules/SearchBar 🔜', module)
  .addDecorator(withInfoDecorator(SearchBar, { inline: true }))
  .addWithJSX('SearchBar', () => {
    return (
      <SearchBar />
    );
  });
