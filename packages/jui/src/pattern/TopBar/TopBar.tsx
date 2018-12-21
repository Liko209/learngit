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
// import { StyledMoreIconButton } from './StyledMoreIconButton';
import { JuiIconButtonProps } from '../../components/Buttons/IconButton';
// import { MenuListCompositionProps } from '../MenuListComposition';

type Props = {
  MainMenu: ComponentType<JuiIconButtonProps>;
  Logo: ComponentType;
  // Search: ComponentType,
  AvatarActions: ComponentType<any>; // ComponentType<MenuListCompositionProps>
  NewActions: ComponentType<any>; // ComponentType<MenuListCompositionProps>
  BackNForward?: ComponentType<any>;
  SearchBar: ComponentType<any>;
};

type States = {
  isShowSearchBar: boolean;
};

class JuiTopBar extends React.Component<Props, States> {
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
      SearchBar,
    } = this.props;
    return (
      <StyledAppBar>
        <StyledToolbar>
          <StyledLeft isShowSearchBar={isShowSearchBar}>
            <StyledMenuWithLogo>
              <MainMenu />
              <Logo />
            </StyledMenuWithLogo>
            {BackNForward ? <BackNForward /> : null}
            <SearchBar
              isShowSearchBar={isShowSearchBar}
              closeSearchBar={this.showSearchBar}
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
            <AvatarActions />
            <NewActions />
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
