/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-17 16:07:05
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import { storiesOf } from '@storybook/react';

import { JuiTextWithLink } from '../TextWithLink';

storiesOf('Components/Text', module).add('TextWithLink', () => {
  return (
    <JuiTextWithLink
      text="You are an admin to this team."
      linkText="Learn about team administration"
    />
  );
});
