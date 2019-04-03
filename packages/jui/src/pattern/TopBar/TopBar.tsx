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
  // Search: ComponentType,
  AvatarActions: ComponentType<any>; // ComponentType<MenuListCompositionProps>
  NewActions: ComponentType<any>; // ComponentType<MenuListCompositionProps>
  BackNForward: ComponentType<any>;
  SearchBar: ComponentType<any>;
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
      // SearchBar,
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
              onClick={this.showSearchBar}
              tooltipTitle="Search"
              size="medium"
            >
              search
            </StyledSearchIconButton>
          </StyledLeft>
          <StyledRight>
            <NewActions />
            <AvatarActions />
            {/* <StyledMoreIconButton tooltipTitle="More" size="medium">
              more_vert
            </StyledMoreIconButton> */}
          </StyledRight>
        </StyledToolbar>
      </StyledAppBar>
    );
  }
}

// JuiTopBar.displayName = 'JuiTopBar';
// JuiTopBar.dependencies = [];

export { JuiTopBar };
