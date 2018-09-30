/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-13 15:50:01
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../foundation/utils/decorators';

import MessageInput from '..';

storiesOf('MessageInput', module)
  .addDecorator(withInfoDecorator(MessageInput, { inline: true }))
  .addWithJSX('MessageInput', () => {
    const onChange = () => {};
    return (
      <MessageInput
        value="test"
        onChange={onChange}
        keyboardEventHandler={{}}
        error=""
      />
    );
  });
