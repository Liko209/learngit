/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-17 16:07:05
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean } from '@storybook/addon-knobs/react';
import JuiLink from '../../../atoms/Link';

import TextWithLink from '../TextWithLink';

storiesOf('Molecules/TextWithLink', module).addWithJSX('TextWithLink', () => {
  const onChange = (event, checked) => console.log(checked);
  return (
    <TextWithLink
      text="You are an admin to this team."
      linkText="Learn about team administration"
      href=""
    />
  );
});
