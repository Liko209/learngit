/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 13:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../foundation/utils/decorators';

import { JuiGroupProfileHeader } from '..';

storiesOf('Pattern', module)
  .addDecorator(withInfoDecorator(JuiGroupProfileHeader, { inline: true }))
  .add('JuiGroupProfileHeader', () => {
    return <JuiGroupProfileHeader text="Profile" />;
  });
