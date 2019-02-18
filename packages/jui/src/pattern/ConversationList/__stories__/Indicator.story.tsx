/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-09 14:05:32
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { JuiIndicatorDraft, JuiIndicatorFailure } from '../Indicator';
import { withInfoDecorator } from '../../../foundation/utils/decorators';

storiesOf('Pattern/ConversationCard/Indicator', module)
  .addDecorator(withInfoDecorator(JuiIndicatorDraft, { inline: true }))
  .add('Draft', () => (
    <div>
      <JuiIndicatorDraft />
    </div>
  ));

storiesOf('Pattern/ConversationCard/Indicator', module)
  .addDecorator(withInfoDecorator(JuiIndicatorFailure, { inline: true }))
  .add('Failure', () => (
    <div>
      <JuiIndicatorFailure />
    </div>
  ));
