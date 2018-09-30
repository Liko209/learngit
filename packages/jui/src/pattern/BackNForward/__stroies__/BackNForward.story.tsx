/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-30 14:45:02
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { BackNForward } from '../index';
import { withInfoDecorator } from '../../../foundation/utils/decorators';

const items = ['ss', '12345'];
storiesOf('Pattern/BackNForward', module)
  .addDecorator(withInfoDecorator(BackNForward, { inline: true }))
  .add('BackNForward', () => {
    return (
      <div style={{ display: 'flex' }}>
        <BackNForward
          menuItems={items}
          open={true}
          backDisabled={false}
          types="backward"
          onClose={() => {}}
        />
        <BackNForward
          menuItems={items}
          open={false}
          forwardDisabled={false}
          onClose={() => {}}
          types="forward"
        />
      </div>
    );
  });
