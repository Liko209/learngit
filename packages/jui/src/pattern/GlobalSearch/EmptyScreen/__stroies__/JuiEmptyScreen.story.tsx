/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-04-09 11:27:23
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { JuiEmptyScreen } from '../EmptyScreen';

storiesOf('Pattern/GlobalSearch/EmptyScreen', module).add('EmptyScreen', () => {
  return (
    <div>
      <JuiEmptyScreen text="asdf asdf" />
    </div>
  );
});
