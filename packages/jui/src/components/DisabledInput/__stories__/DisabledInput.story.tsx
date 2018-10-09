/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-13 15:50:01
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../../../.storybook/storybook.d.ts" />
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../foundation/utils/decorators';

import DisabledInput from '..';

storiesOf('DisabledInput', module)
  .addDecorator(withInfoDecorator(DisabledInput, { inline: true }))
  .addWithJSX('DisabledInput', () => {
    return <DisabledInput text="This team is read-only" />;
  });
