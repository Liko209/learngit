/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-04-09 11:27:23
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { JuiEmptyScreen } from '..';

storiesOf('Pattern', module).add('GlobalSearchEmptyScreen', () => {
  return (
    <div style={{ border: '1px solid #616161' }}>
      <JuiEmptyScreen text="asdf asdf" />
    </div>
  );
});
