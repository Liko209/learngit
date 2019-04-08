/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-27 14:19:09
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { JuiTopBar, JuiLogo, JuiAvatarActions } from '..';
import {
  JuiIconButton,
  JuiIconButtonProps,
} from '../../../components/Buttons/IconButton';
import { MenuListCompositionProps } from '../../MenuListComposition';
import { JuiAvatar } from '../../../components/Avatar';
import { JuiMenuList, JuiMenuItem } from '../../../components';
import { JuiNewActions } from '../../../pattern/TopBar';
import {
  JuiHistoryOperation,
  OPERATION,
} from '../../../pattern/HistoryOperation';
import { JuiSearchBar } from '../../../pattern/SearchBar';

const fakeHandler = () => null;

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
        menu={[]}
        disabled={false}
        tooltipTitle={'Back'}
        onClick={fakeHandler}
        onClickMenu={fakeHandler}
      />
      <JuiHistoryOperation
        type={OPERATION.FORWARD}
        menu={[]}
        tooltipTitle={'Forward'}
        disabled={false}
        onClick={fakeHandler}
        onClickMenu={fakeHandler}
      />
    </>
  );
};

const SearchBar = () => {
  return (
    <JuiSearchBar
      onClose={fakeHandler}
      focus={false}
      tabIndex={0}
      onBlur={fakeHandler}
      onFocus={fakeHandler}
    />
  );
};

storiesOf('Pattern/TopBar', module)
  .addDecorator(withInfoDecorator(JuiTopBar, { inline: true }))
  .add('TopBar', () => (
    <div style={{ padding: '20px', background: 'silver' }}>
      <JuiTopBar
        openGlobalSearch={() => {}}
        searchKey={''}
        searchPlaceholder={'search'}
        onClear={() => {}}
        NewActions={NewActions}
        MainMenu={MainMenu}
        Logo={Logo}
        BackNForward={BackNForward}
        SearchBar={SearchBar}
        AvatarActions={AvatarActions}
      />
    </div>
  ));
