/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:37:17
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { text, boolean } from '@storybook/addon-knobs';
import { JuiMenu, JuiMenuList, JuiMenuItem, JuiSubMenu } from '..';

import { JuiAvatar } from '../../Avatar';
import avatar from '../../Avatar/__stories__/img/avatar.jpg';

import { JuiListItemText } from '../../Lists';
import { JuiIconButton } from 'src/components/Buttons';
import { JuiIconography } from 'src/foundation/Iconography';

const Avatar = <JuiAvatar src={avatar} />;

storiesOf('Components/Menus', module)
  .add('Simple Menu', () => (
    <JuiMenu open={boolean('open', true)}>
      <JuiMenuList>
        <JuiMenuItem disabled onClick={action('onClick Profile')}>
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
  .add('Text MenuItem with secondary action', () => (
    <JuiMenuList style={{ width: '180px' }}>
      <JuiMenuItem
        onClick={action('onClick Profile')}
        secondaryAction={
          <JuiIconButton
            component="a"
            aria-label={'sound'}
            tooltipTitle={'play'}
            size="small"
          >
            download
          </JuiIconButton>
        }
      >
        Profile
      </JuiMenuItem>
    </JuiMenuList>
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
        <JuiSubMenu title="Sub Menu" disabled={boolean('disabled', false)}>
          <JuiMenuItem disabled>Profile</JuiMenuItem>
          <JuiMenuItem>My account</JuiMenuItem>
          <JuiMenuItem>Logout</JuiMenuItem>
          <JuiMenuItem disabled>Profile</JuiMenuItem>
          <JuiMenuItem>My account</JuiMenuItem>
          <JuiMenuItem>Logout</JuiMenuItem>
          <JuiMenuItem disabled>Profile</JuiMenuItem>
          <JuiMenuItem>My account</JuiMenuItem>
          <JuiMenuItem>Logout</JuiMenuItem>
          <JuiMenuItem disabled>Profile</JuiMenuItem>
          <JuiMenuItem>My account</JuiMenuItem>
          <JuiMenuItem>Logout</JuiMenuItem>
          <JuiMenuItem disabled>Profile</JuiMenuItem>
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
