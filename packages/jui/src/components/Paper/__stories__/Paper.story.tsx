/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:37:17
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { JuiPaper } from '..';
import { withInfoDecorator } from '../../../foundation/utils/decorators';

storiesOf('Components', module)
  .addDecorator(withInfoDecorator(JuiPaper, { inline: true }))
  .add('Paper', () => (
    <JuiPaper elevation={1}>
      <h3>This is a sheet of paper.</h3>
      <p>
        Paper can be used to build surface or other elements for your
        application.
      </p>
    </JuiPaper>
  ));
