/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-02-28 10:54:30
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../foundation/utils/decorators';

import { JuiInputSearch } from '..';

storiesOf('Pattern', module)
  .addDecorator(withInfoDecorator(JuiInputSearch, { inline: true }))
  .add('InputSearch', () => {
    return (
      <div style={{ padding: '0 10%' }}>
        <JuiInputSearch placeholder="Search member" />
      </div>
    );
  });
