/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-09 14:05:32
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { JuiIndicatorDraft, JuiIndicatorFailure } from '../Indicator';

storiesOf('Pattern/ConversationCard/Indicator', module).add('Draft', () => (
  <div>
    <JuiIndicatorDraft />
  </div>
));

storiesOf('Pattern/ConversationCard/Indicator', module).add('Failure', () => (
  <div>
    <JuiIndicatorFailure />
  </div>
));
