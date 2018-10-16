/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-13 15:50:01
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../foundation/utils/decorators';

import { JuiDisabledInput } from '..';

storiesOf('Pattern', module)
  .addDecorator(withInfoDecorator(JuiDisabledInput, { inline: true }))
  .add('DisabledInput', () => {
    return <JuiDisabledInput text="This team is read-only" />;
  });
