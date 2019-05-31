/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:37:17
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { text, boolean } from '@storybook/addon-knobs';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { JuiMenu, JuiMenuList, JuiMenuItem, JuiSubMenu } from '..';

import { JuiAvatar } from '../../Avatar';
import avatar from '../../Avatar/__stories__/img/avatar.jpg';

import { JuiListItemText } from '../../Lists';

const Avatar = <JuiAvatar src={avatar} />;

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
  ))
  .add('Text MenuItem', () => (
    <JuiMenuItem onClick={action('onClick Profile')}>Profile</JuiMenuItem>
  ))
  .add('Text MenuItem With Icon', () => (
    <JuiMenuItem onClick={action('onClick Profile')} icon="star">
      Profile
    </JuiMenuItem>
  ))
  .add('2 Lines MenuItem With Avatar', () => {
    const primary = text('primary', 'Two-line item name');
    const secondaryText = text('secondaryText', 'Secondary text');
    return (
      <JuiMenuItem onClick={action('onClick Profile')} avatar={Avatar}>
        <JuiListItemText primary={primary} secondary={secondaryText} />
      </JuiMenuItem>
    );
  })
  .add('SubMenu', () => {
    return (
      <JuiMenuList style={{ width: '180px' }}>
        <JuiSubMenu title="Sub Menu">
          <JuiMenuItem disabled={true}>Profile</JuiMenuItem>
          <JuiMenuItem>My account</JuiMenuItem>
          <JuiMenuItem>Logout</JuiMenuItem>
        </JuiSubMenu>
        <JuiMenuItem onClick={action('onClick My account')}>
          My account
        </JuiMenuItem>
        <JuiMenuItem onClick={action('onClick Logout')}>Logout</JuiMenuItem>
      </JuiMenuList>
    );
  });
