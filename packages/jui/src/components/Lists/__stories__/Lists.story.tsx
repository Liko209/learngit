/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:37:17
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import {
  JuiList,
  JuiListItem,
  JuiListItemIcon,
  JuiListItemText,
} from '../index';

storiesOf('Components/Lists', module)
  .addDecorator(withInfoDecorator(JuiList, { inline: true }))
  .add('Simple List', () => (
    <JuiList>
      <JuiListItem button={true}>
        <JuiListItemText primary="Inbox" />
      </JuiListItem>
      <JuiListItem button={true}>
        <JuiListItemText primary="Drafts" />
      </JuiListItem>
    </JuiList>
  ));
