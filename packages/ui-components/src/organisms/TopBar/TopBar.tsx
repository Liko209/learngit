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
import JuiIconButton, { JuiIconButtonProps } from '../../molecules/IconButton';
import MenuListComposition, {
  TMenuItems,
  TMenuExpandTrigger,
} from '../../molecules/MenuListComposition';
import { spacing, width } from '../../utils';
import { TJuiAvatarWithPresenceProps } from '../../molecules/AvatarWithPresence';
import MenuListPanel from '../../molecules/MenuList';

type TTopBarProps = {
  showLeftPanel: boolean;
  showRightPanel: boolean;
  AvatarWithPresence: React.SFC<TJuiAvatarWithPresenceProps>;
  HeaderIconButton: React.SFC<JuiIconButtonProps>;
  avatarMenuItems: TMenuItems;
  onLeftNavExpand: ((event: React.MouseEvent<HTMLInputElement>) => void);
  headerMenuItems: TMenuItems;
  headerLogo: string;
  menuItems: {}[];
  forwardDisabled: boolean;
  backDisabled: boolean;
  handleNavClose: ((event: React.ChangeEvent | React.TouchEvent | React.MouseEvent<HTMLElement>, index: number) => void);
  handleBackWard: ((event: React.MouseEvent<HTMLSpanElement>) => void);
  handleForward: ((event: React.MouseEvent<HTMLSpanElement>) => void);
  handleButtonPress: ((nav: string, event: React.TouchEvent | React.MouseEvent<HTMLElement>) => void);
  handleButtonRelease: ((event: React.TouchEvent | React.MouseEvent<HTMLElement>) => void);
};

type TTopBarState = {
  topBarState: 'resting' | 'hover';
  isShowSearchBar: boolean;
};

type TTopLeftProps = {
  isShowSearchBar: boolean;
};

const StyledTopBar = styled(AppBar).attrs({ position: 'static' })`
  && {
    min-height: 64px;
    min-width: 400px;
    background-color: ${({ theme }) => `${theme.palette.common.white}`};
    box-shadow: none;
    border-bottom: 1px solid
      rgba(0, 0, 0, ${({ theme }) => `${theme.palette.action.hoverOpacity}`});
    z-index: ${({ theme }) => `${theme.zIndex.tooltip}`};
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
    color: ${({ theme }) => `${theme.palette.primary.main}`};
    font-size: 26px;
    margin-left: ${spacing(4)};
    margin-right: ${spacing(9)};
    width: ${width(41)};
  }
`;

const MenuWithLogo = styled.div`
  display: flex;
  align-items: center;
`;

const BackForward: any = styled.div`
  display: flex;
  visibility: ${(props: { invisible: boolean }) =>
    props.invisible ? 'hidden' : 'visible'};
`;

const StyledAvatarMenuComposition = styled(MenuListComposition)``;

const StyledHeaderMenuComposition = styled(MenuListComposition)``;

const StyledIconMore = styled(JuiIconButton)``;

const StyledIconSearch = styled(JuiIconButton)``;

const StyledSearchBar = styled(SearchBar)``;

const TopLeft = styled<TTopLeftProps, 'div'>('div')`
  display: flex;
  align-items: center;
  @media (min-width: 1280px) {
    flex: 1;
  }

  @media (min-width: 1100px) and (max-width: 1280px) {
    width: ${width(246)};
  }

  @media (max-width: 1100px) {
    flex: 1;
  }

  @media (max-width: 600px) {
    justify-content: space-between;
    ${StyledSearchBar} {
      display: ${({ isShowSearchBar }) => (isShowSearchBar ? 'block' : 'none')};
    }
    ${BackForward} {
      display: none;
    }
    ${StyledIconSearch} {
      display: ${({ isShowSearchBar }) => (isShowSearchBar ? 'none' : 'block')};
    }
    ${TopLogo} {
      display: ${({ isShowSearchBar }) => (isShowSearchBar ? 'none' : 'block')};
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

  @media (min-width: 1280px) {
    width: ${width(66)};
  }

  @media (min-width: 1101px) and (max-width: 1279px) {
    flex: 1;
  }

  @media (max-width: 1100px) {
    width: ${width(21)};
  }

  @media (max-width: 600px) {
    ${StyledAvatarMenuComposition} {
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
      topBarState: 'resting',
      isShowSearchBar: false,
    };
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
    const {
      avatarMenuItems,
      headerMenuItems,
      AvatarWithPresence,
      HeaderIconButton,
      onLeftNavExpand,
      headerLogo,
      handleBackWard,
      handleForward,
      menuItems,
      showLeftPanel,
      showRightPanel,
      backDisabled,
      forwardDisabled,
      handleNavClose,
      handleButtonPress,
      handleButtonRelease,
    } = this.props;
    const isElectron =
      navigator.userAgent.toLowerCase().indexOf(' electron/') > -1;
    return (
      <StyledTopBar>
        <TopBarWrapper
          onMouseOver={this.handleMouseOver}
          onMouseLeave={this.handleMouseLeave}
        >
          <TopLeft isShowSearchBar={isShowSearchBar}>
            <MenuWithLogo>
              <JuiIconButton
                tooltipTitle="Menu"
                size="medium"
                awake={topBarState === 'hover'}
                onClick={onLeftNavExpand}
                data-anchor="expandButton"
              >
                format_list_bulleted
              </JuiIconButton>
              <TopLogo variant="headline">{headerLogo}</TopLogo>
            </MenuWithLogo>
            <BackForward invisible={!isElectron}>
              <MenuListPanel
                items={menuItems}
                open={showLeftPanel}
                handleClose={handleNavClose}
              >
                <JuiIconButton
                  tooltipTitle="Backward"
                  size="small"
                  awake={topBarState === 'hover'}
                  onClick={handleBackWard}
                  disabled={backDisabled}
                  onTouchStart={handleButtonPress!.bind(this, 'backward')}
                  onTouchEnd={handleButtonRelease}
                  onMouseDown={handleButtonPress!.bind(this, 'backward')}
                  onMouseUp={handleButtonRelease}
                >
                  chevron_left
                </JuiIconButton>
              </MenuListPanel>
              <MenuListPanel
                items={menuItems}
                open={showRightPanel}
                handleClose={handleNavClose}
              >
                <JuiIconButton
                  tooltipTitle="Forward"
                  size="small"
                  awake={topBarState === 'hover'}
                  onClick={handleForward}
                  disabled={forwardDisabled}
                  onTouchStart={handleButtonPress!.bind(this, 'forward')}
                  onTouchEnd={handleButtonRelease}
                  onMouseDown={handleButtonPress!.bind(this, 'forward')}
                  onMouseUp={handleButtonRelease}
                >
                  chevron_right
                </JuiIconButton>
              </MenuListPanel>
            </BackForward>
            <StyledSearchBar setSearchBarState={this.setSearchBarState} />
            <StyledIconSearch
              onClick={this.showSearchBar}
              tooltipTitle="Search"
              size="medium"
              awake={topBarState === 'hover'}
            >
              search
            </StyledIconSearch>
          </TopLeft>
          <TopRight>
            <StyledHeaderMenuComposition
              awake={topBarState === 'hover'}
              menuItems={headerMenuItems}
              MenuExpandTrigger={HeaderIconButton as TMenuExpandTrigger}
            />
            <StyledAvatarMenuComposition
              awake={topBarState === 'hover'}
              menuItems={avatarMenuItems}
              MenuExpandTrigger={AvatarWithPresence}
            />
            <StyledIconMore
              tooltipTitle="More"
              size="medium"
              awake={topBarState === 'hover'}
            >
              more_vert
            </StyledIconMore>
          </TopRight>
        </TopBarWrapper>
      </StyledTopBar>
    );
  }
}

export default TopBar;
