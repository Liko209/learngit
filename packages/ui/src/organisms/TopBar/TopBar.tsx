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
import AvatarWithPresence from '../../molecules/AvatarWithPresence';
import MenuListComposition from '../../molecules/MenuListComposition';
import { PresenceProps } from '../../atoms';

type TTopBarProps = {
  avatar?: string;
  handleLeftNavExpand: ((event: React.MouseEvent<HTMLInputElement>) => void);
  handleSignOutClick: ((event: React.MouseEvent<HTMLInputElement>) => void);
} & PresenceProps;

type TTopBarState = {
  topBarState: 'resting' | 'hover';
  screenSize: number;
};

const StyledTopBar = styled(AppBar).attrs({ position: 'static' })`
  && {
    background-color: ${({ theme }) =>
    `${theme.palette.common.white}`};
    box-shadow: none;
    border-bottom: 1px solid rgba(0, 0, 0, ${({ theme }) =>
    `${theme.palette.action.hoverOpacity}`});
  }
`;
const TopBarWrapper = styled(Toolbar)`
  && {
    justify-content: space-between;
    padding: 0 ${({ theme }) => `${theme.spacing.unit * 4}px`};
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

const TopLeft = styled.div`
  display: flex;
  align-items: center;
  flex-basis: ${({ theme }) => `${theme.spacing.unit * 248}px`};
  flex-shrink: ${(props: { screenSize: number }) => {
    return props.screenSize > 1164 ? 0 : 1; // need use spacing unit
  }};
`;

const TopRight = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const BackForward: any = styled.div`
  display: flex;
  visibility: ${(props: { invisible: boolean }) => props.invisible ? 'hidden' : 'visible'};
`;

class TopBar extends React.Component<TTopBarProps, TTopBarState> {
  constructor(props: TTopBarProps) {
    super(props);
    this.state = {
      screenSize: 0,
      topBarState: 'resting',
    };
  }
  onWindowResize = () => {
    this.setState({
      screenSize: document.body.clientWidth,
    });
  }
  componentDidMount() {
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

  render() {
    const { topBarState } = this.state;
    const isElectron = navigator.userAgent.toLowerCase().indexOf(' electron/') > -1;
    return (
      <StyledTopBar>
        <TopBarWrapper onMouseOver={this.handleMouseOver} onMouseLeave={this.handleMouseLeave}>
          <TopLeft screenSize={this.state.screenSize}>
            <IconButton tooltipTitle="Menu" size="medium" awake={topBarState === 'hover'} onClick={this.props.handleLeftNavExpand} data-anchor="expandButton">
              format_list_bulleted
            </IconButton>
            <TopLogo variant="headline">Ringcentral</TopLogo>
            <BackForward invisible={!isElectron}>
              <IconButton tooltipTitle="Backward" size="small" awake={topBarState === 'hover'}>
                chevron_left
              </IconButton>
              <IconButton tooltipTitle="Forward" size="small" awake={topBarState === 'hover'}>
                chevron_right
              </IconButton>
            </BackForward>
            <SearchBar />
          </TopLeft>
          <TopRight>
            <MenuListComposition awake={topBarState === 'hover'} handleSignOutClick={this.props.handleSignOutClick} />
            <AvatarWithPresence src={this.props.avatar} presence={this.props.presence} />
          </TopRight>
        </TopBarWrapper>
      </StyledTopBar>
    );
  }
}

export default TopBar;
