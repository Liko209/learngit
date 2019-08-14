/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-27 14:19:09
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { JuiTopBar, JuiLogo, JuiAvatarActions, JuiNewActions } from '..';
import {
  JuiIconButton,
  JuiIconButtonProps,
} from '../../../components/Buttons/IconButton';
import { MenuListCompositionProps } from '../../MenuListComposition';
import { JuiAvatar } from '../../../components/Avatar';
import { JuiMenuList, JuiMenuItem } from '../../../components/Menus';

import { JuiHistoryOperation, OPERATION } from '../../HistoryOperation';
import bulletedMenu from '../../../assets/jupiter-icon/icon-bubble_lines.svg';
import newActions from '../../../assets/jupiter-icon/icon-zoom-in.svg';

const fakeHandler = () => null;

const MainMenu = (props: JuiIconButtonProps) => {
  return (
    <JuiIconButton
      size="medium"
      tooltipTitle="Main menu"
      {...props}
      symbol={bulletedMenu}
    />
  );
};

const Logo = () => {
  return <JuiLogo>RingCentral</JuiLogo>;
};

const AddIconButton = (props: JuiIconButtonProps) => {
  return (
    <JuiIconButton
      size="medium"
      tooltipTitle="Add"
      {...props}
      symbol={newActions}
    />
  );
};

const NewActions = (props: MenuListCompositionProps) => {
  return (
    <JuiNewActions
      Anchor={AddIconButton}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
    >
      <JuiMenuItem data-test-automation-id="viewYourProfile">
        Profile
      </JuiMenuItem>
    </JuiNewActions>
  );
};

const Avatar = (props: JuiIconButtonProps) => {
  return (
    <JuiAvatar size="large" color="tomato">
      DL
    </JuiAvatar>
  );
};

const AvatarActions = (props: MenuListCompositionProps) => {
  return (
    <JuiAvatarActions
      Anchor={Avatar}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
    >
      <JuiMenuList>
        <JuiMenuItem data-test-automation-id="viewYourProfile">
          Profile
        </JuiMenuItem>
      </JuiMenuList>
    </JuiAvatarActions>
  );
};

const BackNForward = () => {
  return (
    <>
      <JuiHistoryOperation
        type={OPERATION.BACK}
        menu={() => []}
        disabled={false}
        tooltipTitle={'Back'}
        onClick={fakeHandler}
        onClickMenu={fakeHandler}
      />
      <JuiHistoryOperation
        type={OPERATION.FORWARD}
        menu={() => []}
        tooltipTitle={'Forward'}
        disabled={false}
        onClick={fakeHandler}
        onClickMenu={fakeHandler}
      />
    </>
  );
};

storiesOf('Pattern/TopBar', module).add('TopBar', () => (
  <div style={{ padding: '20px', background: 'silver' }}>
    <JuiTopBar
      openGlobalSearch={() => {}}
      searchKey={''}
      searchPlaceholder={'search'}
      onClear={() => {}}
      NewActions={NewActions}
      MainMenu={MainMenu}
      Dialpad={NewActions}
      Logo={Logo}
      BackNForward={BackNForward}
      AvatarActions={AvatarActions}
    />
  </div>
));
