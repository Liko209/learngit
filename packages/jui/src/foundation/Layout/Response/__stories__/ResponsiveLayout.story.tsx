/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-27 16:12:29
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../utils/decorators';
import { JuiResponsiveLayout } from '..';

storiesOf('Foundation/Layout', module)
  .addDecorator(withInfoDecorator(JuiResponsiveLayout, { inline: true }))
  .add('ResponsiveLayout', () => (
    <div style={{ position: 'relative', height: '100px' }}>
      <JuiResponsiveLayout
        tag="conversation1"
        leftNavWidth={0}
        mainPanelIndex={1}
      >
        <div style={{ backgroundColor: 'red', height: '100%' }}>Left rail</div>
        <div style={{ backgroundColor: 'green', height: '100%' }}>
          Conversation thread
        </div>
        <div style={{ backgroundColor: 'blue', height: '100%' }}>
          Right rail
        </div>
      </JuiResponsiveLayout>
      <br />
      <JuiResponsiveLayout
        tag="conversation2"
        leftNavWidth={0}
        mainPanelIndex={1}
      >
        <div style={{ backgroundColor: 'red', height: '100%' }}>Left rail</div>
        <div style={{ backgroundColor: 'green', height: '100%' }}>
          Conversation for @mentions
        </div>
      </JuiResponsiveLayout>
    </div>
  ));
