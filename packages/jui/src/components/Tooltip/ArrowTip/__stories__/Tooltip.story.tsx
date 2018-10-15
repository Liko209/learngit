/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-8-39 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { select } from '@storybook/addon-knobs';
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
      },
      'bottom',
    );
    return (
      <div>
        <JuiArrowTip
          title="I am arrow tip"
          placement={placement}
          // leaveDelay={999999}
        >
          <button style={{ marginLeft: 120 }}>Arrow tool tip and some test</button>
        </JuiArrowTip>
      </div>
    );
  });
