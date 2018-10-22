/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-27 16:12:29
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import styled from '../../../styled-components';
import { withInfoDecorator } from '../../../utils/decorators';
import { JuiTreeColumnResponse } from '..';

storiesOf('Foundation/Layout', module)
  .addDecorator(withInfoDecorator(JuiTreeColumnResponse, { inline: true }))
  .add('Response', () => (
    <div style={{ position: 'relative', height: '100px' }}>
      <JuiTreeColumnResponse tag="conversation" leftNavWidth={0}>
        <div style={{ backgroundColor: 'red', height: '100%' }}>Left rail</div>
        <div style={{ backgroundColor: 'green', height: '100%' }}>Conversation thread</div>
        <div style={{ backgroundColor: 'blue', height: '100%' }}>Right rail</div>
      </JuiTreeColumnResponse>
    </div>
  ));
