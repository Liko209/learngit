/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-27 14:24:37
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { JuiGrid } from '..';
import { JuiPaper } from '../../../../components/Paper';

storiesOf('Foundation/Layout', module).add('Grid', () => (
  <div>
    <JuiGrid container={true} spacing={24}>
      <JuiGrid item={true} xs={12}>
        <JuiPaper>xs=12</JuiPaper>
      </JuiGrid>
      <JuiGrid item={true} xs={6}>
        <JuiPaper>xs=6</JuiPaper>
      </JuiGrid>
      <JuiGrid item={true} xs={6}>
        <JuiPaper>xs=6</JuiPaper>
      </JuiGrid>
      <JuiGrid item={true} xs={3}>
        <JuiPaper>xs=3</JuiPaper>
      </JuiGrid>
      <JuiGrid item={true} xs={3}>
        <JuiPaper>xs=3</JuiPaper>
      </JuiGrid>
      <JuiGrid item={true} xs={3}>
        <JuiPaper>xs=3</JuiPaper>
      </JuiGrid>
      <JuiGrid item={true} xs={3}>
        <JuiPaper>xs=3</JuiPaper>
      </JuiGrid>
    </JuiGrid>
  </div>
));
