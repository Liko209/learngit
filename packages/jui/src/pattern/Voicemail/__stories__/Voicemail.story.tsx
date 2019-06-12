/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-27 14:19:09
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { text, boolean, number } from '@storybook/addon-knobs';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
// import { VoicemailActions } from '../VoicemailActions';

const knobs = {
  displayName: () => text('displayName', 'Two-line item name'),
  isRead: () => boolean('isRead', true),
  phoneNumber: () => text('phoneNumber', 'XX/XX/XXXX'),
  maxCount: () => number('maxCount', 0),
};

storiesOf('Pattern/Voicemail', module)
  // .addDecorator(withInfoDecorator(JuiTopBar, { inline: true }))
  .add('Actions', () => (
    <div style={{ padding: '20px' }}>
      1324
    </div>
  ))
  ;
