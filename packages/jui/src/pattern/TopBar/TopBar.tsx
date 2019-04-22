/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-29 10:36:16
 * Copyright © RingCentral. All rights reserved.
 */

import React, { ComponentType } from 'react';
import { StyledAppBar } from './StyledAppBar';
import { StyledToolbar } from './StyledToolbar';
import { StyledMenuWithLogo } from './StyledMenuWithLogo';
import { StyledSearchIconButton } from './StyledSearchIconButton';
import { StyledLeft } from './StyledLeft';
import { StyledRight } from './StyledRight';
import { StyledJuiSearchBar } from './StyledSearchBar';

type Props = {
  MainMenu: ComponentType<any>;
  Logo: ComponentType;
  AvatarActions: ComponentType<any>; // ComponentType<MenuListCompositionProps>
  NewActions: ComponentType<any>; // ComponentType<MenuListCompositionProps>
  Dialpad: ComponentType<any>; // ComponentType<MenuListCompositionProps>
  BackNForward: ComponentType<any>;
  openGlobalSearch: (event: React.MouseEvent<HTMLElement>) => void;
  searchKey: string;
  searchPlaceholder: string;
  onClear: () => void;
};

type States = {
  isShowSearchBar: boolean;
};

class JuiTopBar extends React.PureComponent<Props, States> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isShowSearchBar: false,
    };
  }

  showSearchBar = () => {
    this.setState(prevState => ({
      isShowSearchBar: !prevState.isShowSearchBar,
    }));
  }

  render() {
    const { isShowSearchBar } = this.state;
    const {
      MainMenu,
      Logo,
      AvatarActions,
      NewActions,
      BackNForward,
      openGlobalSearch,
      searchKey,
      searchPlaceholder,
      onClear,
      Dialpad,
    } = this.props;
    return (
      <StyledAppBar>
        <StyledToolbar>
          <StyledLeft isShowSearchBar={isShowSearchBar}>
            <StyledMenuWithLogo>
              <MainMenu />
              <Logo />
            </StyledMenuWithLogo>
            <BackNForward />
            <StyledJuiSearchBar
              onClick={openGlobalSearch}
              value={searchKey}
              onClear={onClear}
              placeholder={searchPlaceholder}
              // isShowSearchBar={isShowSearchBar}
              // closeSearchBar={this.showSearchBar}
            />
            <StyledSearchIconButton
              onClick={openGlobalSearch}
              tooltipTitle="Search"
              size="medium"
              color="common.white"
            >
              search
            </StyledSearchIconButton>
          </StyledLeft>
          <StyledRight>
            <Dialpad />
            <NewActions />
            <AvatarActions />
          </StyledRight>
        </StyledToolbar>
      </StyledAppBar>
    );
  }
}

export { JuiTopBar };
