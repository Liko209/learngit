/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-30 14:45:02
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { JuiBackNForward } from '../index';
import { withInfoDecorator } from '../../../foundation/utils/decorators';

const items = ['back and forwards', '12345'];
storiesOf('Pattern/BackNForward', module)
  .addDecorator(withInfoDecorator(JuiBackNForward, { inline: true }))
  .add('BackNForward', () => {
    return (
      <div style={{ display: 'flex' }}>
        <JuiBackNForward
          menuItems={items}
          open={true}
          backDisabled={false}
          types="backward"
          onButtonPress={null}
          onButtonRelease={null}
          onClose={() => {}}
        />
        <JuiBackNForward
          menuItems={items}
          open={false}
          forwardDisabled={false}
          onClose={() => {}}
          onButtonPress={null}
          onButtonRelease={null}
          types="forward"
        />
      </div>
    );
  });
