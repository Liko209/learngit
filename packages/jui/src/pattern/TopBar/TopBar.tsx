/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-29 10:36:16
 * Copyright © RingCentral. All rights reserved.
 */

import React, { ComponentType } from 'react';
import { StyledAppBar } from './StyledAppBar';
import { StyledToolbar } from './StyledToolbar';
import { StyledMenuWithLogo } from './StyledMenuWithLogo';
import { StyledSearchBar } from './StyledSearchBar';
import { StyledSearchIconButton } from './StyledSearchIconButton';
import { StyledLeft } from './StyledLeft';
import { StyledRight } from './StyledRight';
import { StyledMoreIconButton } from './StyledMoreIconButton';
import { JuiIconButtonProps } from '../../components/Buttons/IconButton';
// import { MenuListCompositionProps } from '../MenuListComposition';

type Props = {
  MainMenu: ComponentType<JuiIconButtonProps>,
  Logo: ComponentType,
  // Search: ComponentType,
  Menu: ComponentType<any>, // ComponentType<MenuListCompositionProps>
  Avatar: ComponentType<any>, // ComponentType<MenuListCompositionProps>
};

type States = {
  topBarState: 'resting' | 'hover';
  isShowSearchBar: boolean;
};

class JuiTopBar extends React.Component<Props, States> {
  constructor(props: Props) {
    super(props);
    this.state = {
      topBarState: 'resting',
      isShowSearchBar: false,
    };
  }

  handleMouseOver = () => {
    this.setState({ topBarState: 'hover' });
  }

  handleMouseLeave = () => {
    this.setState({ topBarState: 'resting' });
  }

  setSearchBarState = (isShowSearchBar: boolean) => {
    this.setState({ isShowSearchBar });
  }

  showSearchBar = () => {
    this.setState({ isShowSearchBar: true });
  }

  render() {
    const { topBarState, isShowSearchBar } = this.state;
    const { MainMenu, Logo, Menu, Avatar } = this.props;
    return (
      <StyledAppBar>
        <StyledToolbar onMouseOver={this.handleMouseOver} onMouseLeave={this.handleMouseLeave}>
          <StyledLeft isShowSearchBar={isShowSearchBar}>
            <StyledMenuWithLogo>
              <MainMenu awake={topBarState === 'hover'} />
              <Logo />
            </StyledMenuWithLogo>
            <StyledSearchBar setSearchBarState={this.setSearchBarState} />
            <StyledSearchIconButton
              onClick={this.showSearchBar}
              tooltipTitle="Search"
              size="medium"
              awake={topBarState === 'hover'}
            >
              search
            </StyledSearchIconButton>
          </StyledLeft>
          <StyledRight>
            <Menu awake={topBarState === 'hover'} />
            <Avatar awake={topBarState === 'hover'} />
            <StyledMoreIconButton
              awake={topBarState === 'hover'}
              tooltipTitle="More"
              size="medium"
            >
              more_vert
            </StyledMoreIconButton>
          </StyledRight>
        </StyledToolbar>
      </StyledAppBar>
    );
  }
}

// JuiTopBar.displayName = 'JuiTopBar';
// JuiTopBar.dependencies = [];

export { JuiTopBar };
