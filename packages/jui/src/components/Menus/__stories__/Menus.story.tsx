/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:37:17
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { boolean } from '@storybook/addon-knobs';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { JuiMenu, JuiMenuList, JuiMenuItem } from '../index';

storiesOf('Components/Menus', module)
  .addDecorator(withInfoDecorator(JuiMenu, { inline: true }))
  .add('Simple Menu', () => (
    <JuiMenu open={boolean('open', true)}>
      <JuiMenuList>
        <JuiMenuItem disabled={true} onClick={action('onClick Profile')}>
          Profile
        </JuiMenuItem>
        <JuiMenuItem onClick={action('onClick My account')}>
          My account
        </JuiMenuItem>
        <JuiMenuItem onClick={action('onClick Logout')}>Logout</JuiMenuItem>
      </JuiMenuList>
    </JuiMenu>
  ));
