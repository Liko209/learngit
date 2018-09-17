/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-08-21 10:31:21
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../../../.storybook/storybook.d.ts" />
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../utils/decorators';

import TopBar from '..';
import JuiAvatarWithPresence, {
  TJuiAvatarWithPresenceProps,
} from '../../../molecules/AvatarWithPresence';
import JuiIconButton, {
  JuiIconButtonProps,
} from '../../../molecules/IconButton';

import avatar from '../../../atoms/Avatar/__stories__/img/avatar.jpg';

const onLeftNavExpand = () => {};
const handleSignOutClick = () => {};
const handleCreateTeam = () => {};

const AvatarWithPresence = (props: TJuiAvatarWithPresenceProps) => {
  return <JuiAvatarWithPresence presence="online" src={avatar} {...props} />;
};

const HeaderIconButton = (props: JuiIconButtonProps) => {
  return (
    <JuiIconButton size="medium" tooltipTitle="plus" {...props}>
      add_circle
    </JuiIconButton>
  );
};

storiesOf('Organisms/TopBar', module)
  .addDecorator(withInfoDecorator(TopBar, { inline: true }))
  .addWithJSX('TopBar', () => {
    return (
      <TopBar
        AvatarWithPresence={AvatarWithPresence}
        avatarMenuItems={[
          {
            label: 'signOut',
            onClick: handleSignOutClick,
          },
        ]}
        HeaderIconButton={HeaderIconButton}
        headerMenuItems={[
          {
            label: 'Create Team',
            onClick: handleCreateTeam,
          },
        ]}
        onLeftNavExpand={onLeftNavExpand}
      />
    );
  });
