/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-27 16:12:29
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { JuiResponsiveLayout } from '..';
import { withResponsive, VISUAL_MODE } from '../Responsive';

const DIV1 = () => (
  <div style={{ backgroundColor: 'red', height: '100%' }}>Left rail</div>
);
const DIV2 = () => (
  <div style={{ backgroundColor: 'green', height: '100%' }}>
    Conversation thread
  </div>
);
const DIV3 = () => (
  <div style={{ backgroundColor: 'blue', height: '100%' }}>Right rail</div>
);

const Div1 = withResponsive(DIV1, {
  maxWidth: 360,
  minWidth: 180,
  defaultWidth: 268,
  visualMode: VISUAL_MODE.AUTOMATIC,
  enable: {
    right: true,
  },
  priority: 1,
});
const Div2 = withResponsive(DIV2, {
  minWidth: 400,
  priority: 2,
});
const Div3 = withResponsive(DIV3, {
  maxWidth: 360,
  minWidth: 180,
  defaultWidth: 268,
  visualMode: VISUAL_MODE.BOTH,
  enable: {
    left: true,
  },
  priority: 3,
});

storiesOf('Foundation/Layout', module).add('ResponsiveLayout', () => (
  <div style={{ position: 'relative', height: '100px' }}>
    <JuiResponsiveLayout>
      <Div1 />
      <Div2 />
      <Div3 />
    </JuiResponsiveLayout>
  </div>
));
