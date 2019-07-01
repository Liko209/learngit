/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-13 15:50:01
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';

import { JuiDisabledInput } from '..';

storiesOf('Pattern', module).add('DisabledInput', () => {
  return <JuiDisabledInput text="This team is read-only" />;
});
