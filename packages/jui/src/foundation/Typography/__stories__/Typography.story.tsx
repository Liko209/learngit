/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-27 16:11:46
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { JuiTypography } from '..';

storiesOf('Foundation', module)
  .addDecorator(withInfoDecorator(JuiTypography, { inline: true }))
  .add('Typography', () => (
    <div>
      <JuiTypography variant="headline" component="h3">
        This is a sheet of paper.
      </JuiTypography>
      <JuiTypography component="p">
        Paper can be used to build surface or other elements for your
        application.
      </JuiTypography>
    </div>
  ));
