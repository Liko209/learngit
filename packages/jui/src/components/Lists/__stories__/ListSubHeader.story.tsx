/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:37:17
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { text } from '@storybook/addon-knobs';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { JuiListSubheader } from '../index';

storiesOf('Components/Lists', module)
  .addDecorator(withInfoDecorator(JuiListSubheader, { inline: true }))
  .add('JuiListSubheader', () => {
    const t = text('title', 'Pinned Posts (24)');
    return (
      <div>
        <JuiListSubheader>{t}</JuiListSubheader>
      </div>
    );
  });
