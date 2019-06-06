/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-05-24 15:55:14
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import { storiesOf } from '@storybook/react';

import { JuiTextWithHighlight } from '../TextWithHighlight';

storiesOf('Components/Text', module).add('TextWithHighlight', () => {
  return <JuiTextWithHighlight>abcde</JuiTextWithHighlight>;
});
