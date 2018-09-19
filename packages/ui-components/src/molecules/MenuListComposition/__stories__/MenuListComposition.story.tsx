/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-08-22 11:04:21
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../../../.storybook/storybook.d.ts" />
import * as React from 'react';
import { storiesOf } from '@storybook/react';

import MenuListComposition from '..';
import JuiAvatarWithPresence, {
  TJuiAvatarWithPresenceProps,
} from '../../../molecules/AvatarWithPresence';
import { withInfoDecorator } from '../../../utils/decorators';

import avatar from '../../../atoms/Avatar/__stories__/img/avatar.jpg';

const avatarMenuItems = [
  {
    label: 'signOut',
    onClick: this.handleSignOutClick,
  },
];

const AvatarWithPresence = (props: TJuiAvatarWithPresenceProps) => {
  return <JuiAvatarWithPresence presence="online" src={avatar} {...props} />;
};

storiesOf('Molecules/MenuListComposition 🔜', module)
  .addDecorator(withInfoDecorator(MenuListComposition, { inline: true }))
  .addWithJSX('MenuListComposition with Avatar', () => {
    return (
      <MenuListComposition
        menuItems={avatarMenuItems}
        MenuExpandTrigger={AvatarWithPresence}
      />
    );
  });
