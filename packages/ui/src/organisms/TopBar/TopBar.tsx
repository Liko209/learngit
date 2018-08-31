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
import IconButton from '../../molecules/IconButton';
import MenuListComposition from '../../molecules/MenuListComposition';
import { PresenceProps } from '../../atoms';
import { spacing } from '../../utils';

type TTopBarProps = {
  avatar?: string;
  onLeftNavExpand: ((event: React.MouseEvent<HTMLInputElement>) => void);
  onSignOutClick: ((event: React.MouseEvent<HTMLInputElement>) => void);
} & PresenceProps;

type TTopBarState = {
  topBarState: 'resting' | 'hover';
  screenSize: number;
  isShowSearchBar: boolean;
};

const StyledTopBar = styled(AppBar).attrs({ position: 'static' })`
  && {
    min-height: 64px;
    background-color: ${({ theme }) =>
    `${theme.palette.common.white}`};
    box-shadow: none;
    border-bottom: 1px solid rgba(0, 0, 0, ${({ theme }) =>
    `${theme.palette.action.hoverOpacity}`});
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

const StyledIconMore = styled(IconButton)``;

const StyledIconSearch = styled(IconButton)``;

const StyledSearchBar = styled(SearchBar)``;

const TopLeft = styled.div`
  display: flex;
  align-items: center;
  @media (max-width: 1920px) {
    flex: 0 1 1624px;
  }
  @media (max-width: 1280px) {
    flex: 0 0 984px;
  }
  @media (max-width: 1100px) {
    flex: 0 1 984px;
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
  @media (max-width: 1920px) {
    flex: 0 0 264px;
  }
  @media (max-width: 1280px) {
    flex: 0 1 264px;
  }
  @media (max-width: 1100px) {
    flex: 0 1 auto;
  }
  @media (max-width: 600px) {
    ${StyledMenuListComposition} {
      display: none;
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
      topBarState: 'resting',
      isShowSearchBar: false,
    };
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

  render() {
    const { topBarState, isShowSearchBar } = this.state;
    const isElectron = navigator.userAgent.toLowerCase().indexOf(' electron/') > -1;
    return (
      <StyledTopBar>
        <TopBarWrapper onMouseOver={this.handleMouseOver} onMouseLeave={this.handleMouseLeave}>
          <TopLeft isShowSearchBar={isShowSearchBar}>
            <MenuWithLogo>
              <IconButton tooltipTitle="Menu" size="medium" awake={topBarState === 'hover'} onClick={this.props.onLeftNavExpand} data-anchor="expandButton">
                format_list_bulleted
              </IconButton>
              <TopLogo variant="headline">RingCentral</TopLogo>
            </MenuWithLogo>
            <BackForward invisible={!isElectron}>
              <IconButton tooltipTitle="Backward" size="small" awake={topBarState === 'hover'}>
                chevron_left
              </IconButton>
              <IconButton tooltipTitle="Forward" size="small" awake={topBarState === 'hover'}>
                chevron_right
              </IconButton>
            </BackForward>
            <StyledSearchBar setSearchBarState={this.setSearchBarState} />
            <StyledIconSearch onClick={this.showSearchBar} tooltipTitle="Search" size="medium" awake={topBarState === 'hover'}>
              search
            </StyledIconSearch>
          </TopLeft>
          <TopRight>
            <IconButton
              size="medium"
              tooltipTitle="plus"
              awake={topBarState === 'hover'}
            >
              add_circle
            </IconButton>
            <StyledMenuListComposition
              awake={topBarState === 'hover'}
              handleSignOutClick={this.props.onSignOutClick}
              src={this.props.avatar}
              presence={this.props.presence}
            />
            <StyledIconMore tooltipTitle="More" size="medium" awake={topBarState === 'hover'}>
              more_vert
            </StyledIconMore>
          </TopRight>
        </TopBarWrapper>
      </StyledTopBar>
    );
  }
}

export default TopBar;
