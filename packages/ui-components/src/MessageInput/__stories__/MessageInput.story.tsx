/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-13 15:50:01
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../../.storybook/storybook.d.ts" />
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { select } from '@storybook/addon-knobs/react';
import { withInfoDecorator } from '../../utils/decorators';

import MessageInput from '..';

storiesOf('MessageInput', module)
  .addDecorator(withInfoDecorator(MessageInput, { inline: true }))
  .addWithJSX('MessageInput', () => {
    return <MessageInput />;
  });
