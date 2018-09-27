/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:37:17
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { JuiList, JuiListItem, JuiListItemText } from '..';

storiesOf('Components/List', module)
  .addDecorator(withInfoDecorator(JuiList, { inline: true }))
  .add('Simple List', () => (
    <JuiList>
      <JuiListItem button={true}>
        <JuiListItemText primary="text 1" />
      </JuiListItem>
      <JuiListItem button={true}>
        <JuiListItemText primary="text 2" />
      </JuiListItem>
      <JuiListItem button={true}>
        <JuiListItemText primary="text 3" />
      </JuiListItem>
    </JuiList>
  ));
