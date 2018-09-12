/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-08-20 19:01:50
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../styled-components';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import SearchBar from '../../molecules/SearchBar';
import JuiIconButton from '../../molecules/IconButton';
import MenuListComposition from '../../molecules/MenuListComposition';
import { PresenceProps } from '../../atoms';
import { spacing } from '../../utils';
import AvatarWithPresence from '../../molecules/AvatarWithPresence';
import MenuItem from '@material-ui/core/MenuItem';

type TTopBarProps = {
  showLeftPanel: boolean,
  showRightPanel: boolean,
  avatar?: string;
  awake?: boolean;
  onLeftNavExpand: ((event: React.MouseEvent<HTMLInputElement>) => void);
  onSignOutClick: ((event: React.MouseEvent<HTMLInputElement>) => void);
  menuItems?: any[];
  forwardDisabled?: boolean;
  backDisabled?: boolean;
  handleNavClose?: ((event: React.ChangeEvent|React.TouchEvent|React.MouseEvent<HTMLElement>, index: number) => void);
  handleBackWard?: ((event: React.MouseEvent<HTMLSpanElement>) => void);
  handleForward?: ((event: React.MouseEvent<HTMLSpanElement>) => void);
  handleButtonPress?: ((event: React.TouchEvent|React.MouseEvent<HTMLElement>) => void);
  handleButtonRelease?: ((event: React.TouchEvent|React.MouseEvent<HTMLElement>, nav: string) => void);
} & PresenceProps;

type TTopBarState = {
  topBarState: 'resting' | 'hover';
  screenSize: number;
  open: boolean;
  isShowSearchBar: boolean;
};

const StyledTopBar = styled(AppBar).attrs({ position: 'static' })`
  && {
    min-height: 64px;
    min-width: 400px;
    background-color: ${({ theme }) =>
    `${theme.palette.common.white}`};
    box-shadow: none;
    border-bottom: 1px solid rgba(0, 0, 0, ${({ theme }) =>
    `${theme.palette.action.hoverOpacity}`});
    z-index: ${({ theme }) =>
    `${theme.zIndex.tooltip}`};
  }
`;
const TopBarWrapper = styled(Toolbar)`
  && {
    min-height: 64px;
    justify-content: space-between;
    padding: 0 ${spacing(4)};
    &:hover {
      .react-select__control {
        background: ${({ theme }) => theme.palette.grey[300]};
        border: 1px solid ${({ theme }) => theme.palette.grey[300]};
      }
    }
  }
`;
const TopLogo = styled(Typography)`
  && {
    color: ${({ theme }) =>
    `${theme.palette.primary.main}`};
    font-size: 26px;
    margin-left: ${({ theme }) => `${theme.spacing.unit * 4}px`};
    margin-right: ${({ theme }) => `${theme.spacing.unit * 9}px`};
    width: ${({ theme }) => `${theme.spacing.unit * 41}px`};
  }
`;

const MenuWithLogo = styled.div`
  display: flex;
  align-items: center;
`;

const BackForward: any = styled.div`
  display: flex;
  visibility: ${(props: { invisible: boolean }) => props.invisible ? 'hidden' : 'visible'};
`;

const StyledMenuListComposition = styled(MenuListComposition)``;

const StyledIconPlus = styled(JuiIconButton)``;

const StyledIconMore = styled(JuiIconButton)``;

const StyledIconSearch = styled(JuiIconButton)``;

const StyledSearchBar = styled(SearchBar)``;

const TopLeft = styled.div`
  display: flex;
  align-items: center;

  @media (min-width: 1280px) and (max-width: 1920px) {
    flex: 1;
  }

  @media (min-width: 1100px) and (max-width: 1280px) {
    width: ${({ theme }) => `${246 * theme.size.width}px`};
  }

  @media (max-width: 1100px) {
    flex: 1;
  }

  @media (max-width: 600px) {
    justify-content: space-between;
    ${StyledSearchBar} {
      display: ${(props: { isShowSearchBar: boolean }) => props.isShowSearchBar ? 'block' : 'none'};
    }
    ${BackForward} {
      display: none;
    }
    ${StyledIconSearch} {
      display: ${(props: { isShowSearchBar: boolean }) => props.isShowSearchBar ? 'none' : 'block'};
    }
    ${TopLogo} {
      display: ${(props: { isShowSearchBar: boolean }) => props.isShowSearchBar ? 'none' : 'block'};
    }
  }
  @media (min-width: 601px) {
    ${StyledIconSearch} {
      display: none;
    }
  }
`;

const TopRight = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;

  @media (min-width: 1280px) and (max-width: 1920px) {
    width: ${({ theme }) => `${66 * theme.size.width}px`};
  }

  @media (min-width: 1101px) and (max-width: 1279px) {
    flex: 1;
  }

  @media (max-width: 1100px) {
    width: ${({ theme }) => `${21 * theme.size.width}px`};
  }

  @media (max-width: 600px) {
    ${StyledMenuListComposition} {
      display: none;
      color: red;
    }
  }
  @media (min-width: 601px) {
    ${StyledIconMore} {
      display: none;
    }
  }
`;

class TopBar extends React.Component<TTopBarProps, TTopBarState> {
  constructor(props: TTopBarProps) {
    super(props);
    this.state = {
      screenSize: 0,
      open: false,
      topBarState: 'resting',
      isShowSearchBar: false,
    };
  }
  anchorEl = React.createRef<HTMLElement>();
  handleClose = (event: React.ChangeEvent|React.TouchEvent|React.MouseEvent<Element>) => {
    const node = this.anchorEl.current;
    if (node && node.contains(event.currentTarget)) {
      return;
    }
    this.setState({
      open: false,
    });
  }
  onWindowResize = () => {
    this.setState({
      screenSize: document.body.clientWidth,
    });
  }
  componentDidMount() {
    this.setState({
      screenSize: document.body.clientWidth,
    });
    window.addEventListener('resize', this.onWindowResize);
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
  }

  handleMouseOver = () => {
    this.setState({
      topBarState: 'hover',
    });
  }
  handleMouseLeave = () => {
    this.setState({
      topBarState: 'resting',
    });
  }

  showSearchBar = () => {
    this.setState({
      isShowSearchBar: true,
    });
  }

  setSearchBarState = (isShowSearchBar: boolean) => {
    this.setState({
      isShowSearchBar,
    });
  }
  handleToggle = () => {
    this.setState({
      open: !this.state.open,
    });
  }
  handleMenuItem = () => {
    const signOut = <MenuItem onClick={this.props.onSignOutClick} key={2}>Logout</MenuItem>;
    const MENUITEM = [signOut];
    return MENUITEM;
  }

  render() {
    const { topBarState, isShowSearchBar, open } = this.state;
    const {
      avatar,
      presence,
      handleBackWard,
      handleForward,
      menuItems,
      showLeftPanel,
      showRightPanel,
      backDisabled,
      forwardDisabled,
      handleNavClose,
      handleButtonPress,
      handleButtonRelease } = this.props;
    const isElectron = navigator.userAgent.toLowerCase().indexOf(' electron/') > -1;
    return (
      <StyledTopBar>
        <TopBarWrapper onMouseOver={this.handleMouseOver} onMouseLeave={this.handleMouseLeave}>
          <TopLeft isShowSearchBar={isShowSearchBar}>
            <MenuWithLogo>
              <JuiIconButton tooltipTitle="Menu" size="medium" awake={topBarState === 'hover'} onClick={this.props.onLeftNavExpand} data-anchor="expandButton">
                format_list_bulleted
              </JuiIconButton>
              <TopLogo variant="headline">RingCentral</TopLogo>
            </MenuWithLogo>
            <BackForward invisible={!isElectron}>
              <StyledMenuListComposition
                items={menuItems}
                open={showLeftPanel}
                handleClose={handleNavClose!}
              >
                <JuiIconButton
                  tooltipTitle="Backward"
                  size="small"
                  awake={topBarState === 'hover'}
                  onClick={handleBackWard}
                  disabled={backDisabled}
                  onTouchStart={handleButtonPress}
                  onTouchEnd={handleButtonRelease!.bind(this, '', 'backward')}
                  onMouseDown={handleButtonPress}
                  onMouseUp={handleButtonRelease!.bind(this, '', 'backward')}
                >
                  chevron_left
                </JuiIconButton>
              </StyledMenuListComposition>
              <StyledMenuListComposition
                items={menuItems}
                open={showRightPanel}
                handleClose={handleNavClose!}
              >
                <JuiIconButton
                  tooltipTitle="Forward"
                  size="small"
                  awake={topBarState === 'hover'}
                  onClick={handleForward}
                  disabled={forwardDisabled}
                  onTouchStart={handleButtonPress}
                  onTouchEnd={handleButtonRelease!.bind(this, '', 'forward')}
                  onMouseDown={handleButtonPress}
                  onMouseUp={handleButtonRelease!.bind(this, '', 'forward')}
                >
                  chevron_right
                </JuiIconButton>
              </StyledMenuListComposition>
            </BackForward>
            <StyledSearchBar setSearchBarState={this.setSearchBarState} />
            <StyledIconSearch onClick={this.showSearchBar} tooltipTitle="Search" size="medium" awake={topBarState === 'hover'}>
              search
            </StyledIconSearch>
          </TopLeft>
          <TopRight>
            <StyledIconPlus
              size="medium"
              tooltipTitle="plus"
              awake={topBarState === 'hover'}
            >
              add_circle
            </StyledIconPlus>
            <StyledMenuListComposition
              items={this.handleMenuItem()}
              handleClose={this.handleClose}
              open={open}
            >
              <AvatarWithPresence
                innerRef={this.anchorEl}
                aria-haspopup="true"
                src={avatar}
                presence={presence}
                onClick={this.handleToggle}
              />
            </StyledMenuListComposition>
          </TopRight>
        </TopBarWrapper>
      </StyledTopBar>
    );
  }
}

export default TopBar;
