/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-05-29 09:46:23
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { JuiAtMention } from '../AtMention';
import { boolean } from '@storybook/addon-knobs';

storiesOf('Components/AtMention', module).add('AtMention', () => {
  return (
    <JuiAtMention
      name={'Josh Smith'}
      id="123"
      data-name="dddd"
      isCurrent={boolean('isCurrent', false)}
    />
  );
});
