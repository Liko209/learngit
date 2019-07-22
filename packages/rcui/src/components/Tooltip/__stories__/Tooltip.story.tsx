/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-03-18 16:50:06
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { select, text } from '@storybook/addon-knobs';
import { RuiTooltip } from '../Tooltip';

storiesOf('Tooltip', module).add('Tooltip', () => {
  const placement = select(
    'placement',
    {
      top: 'top',
      right: 'right',
      bottom: 'bottom',
      left: 'left',
    },
    'bottom',
  );
  const content = text('tooltip', 'I am arrow tip');
  return (
    <div>
      <RuiTooltip title={content} placement={placement}>
        <button style={{ marginLeft: 120 }}>
          Arrow tool tip and some test
        </button>
      </RuiTooltip>
    </div>
  );
});
