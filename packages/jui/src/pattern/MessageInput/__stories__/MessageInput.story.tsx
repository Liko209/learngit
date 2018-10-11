/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-13 15:50:01
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../foundation/utils/decorators';

import { JuiMessageInput } from '..';

storiesOf('Pattern', module)
  .addDecorator(withInfoDecorator(JuiMessageInput, { inline: true }))
  .addWithJSX('MessageInput', () => {
    const onChange = () => {};
    return (
      <JuiMessageInput
        value="test"
        onChange={onChange}
        keyboardEventHandler={{}}
        error=""
      />
    );
  });
