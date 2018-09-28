/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-8-39 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { select } from '@storybook/addon-knobs/react';
import { JuiArrowTip } from '..';
import { withInfoDecorator } from '../../../../foundation/utils/decorators';

storiesOf('Components/Tooltip', module)
  .addDecorator(withInfoDecorator(JuiArrowTip, { inline: true }))
  .add('ArrowTip', () => {
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
    return (
      <div>
        <JuiArrowTip
          title="I am arrow tip"
          placement={placement}
        >
          <button>Arrow tool tip and some test</button>
        </JuiArrowTip>
      </div>
    );
  });
