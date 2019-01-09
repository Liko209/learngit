/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-27 14:19:09
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { JuiTopBar, JuiLogo, JuiAddMenu, JuiAvatarMenu } from '..';
import {
  JuiIconButton,
  JuiIconButtonProps,
} from '../../../components/Buttons/IconButton';
import { MenuListCompositionProps } from '../../MenuListComposition';
import { JuiAvatar } from '../../../components/Avatar';

const handleClick = () => {};

const MainMenu = (props: JuiIconButtonProps) => {
  return (
    <JuiIconButton size="medium" tooltipTitle="Main menu" {...props}>
      bulleted_menu
    </JuiIconButton>
  );
};

const Logo = () => {
  return <JuiLogo>RingCentral</JuiLogo>;
};

const AddIconButton = (props: JuiIconButtonProps) => {
  return (
    <JuiIconButton size="medium" tooltipTitle="Add" {...props}>
      new_actions
    </JuiIconButton>
  );
};

const AddMenu = (props: MenuListCompositionProps) => {
  return (
    <JuiAddMenu
      menuItems={[
        {
          label: 'Create Team',
          onClick: handleClick,
        },
      ]}
      MenuExpandTrigger={AddIconButton}
      {...props}
    />
  );
};

const Avatar = (props: JuiIconButtonProps) => {
  return (
    <JuiAvatar size="large" color="tomato">
      DL
    </JuiAvatar>
  );
};

const AvatarMenu = (props: MenuListCompositionProps) => {
  return (
    <JuiAvatarMenu
      menuItems={[
        {
          label: 'Logout',
          onClick: handleClick,
        },
      ]}
      MenuExpandTrigger={Avatar}
      {...props}
    />
  );
};

storiesOf('Pattern/TopBar', module)
  .addDecorator(withInfoDecorator(JuiTopBar, { inline: true }))
  .add('TopBar', () => (
    <JuiTopBar
      MainMenu={MainMenu}
      Logo={Logo}
      AddMenu={AddMenu}
      AvatarMenu={AvatarMenu}
    />
  ));
