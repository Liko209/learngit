/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-8-23 10:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import MuiList from '@material-ui/core/List/index';
import MuiDrawer, { DrawerProps } from '@material-ui/core/Drawer/index';
import styled from '../../foundation/styled-components';
import { JuiIconography } from '../../foundation/Iconography';
import { JuiArrowTip } from '../../components/index';
import { height, grey, palette, spacing } from '../../foundation/utils/styles';

import {
  JuiListItem,
  JuiListItemIcon,
  JuiListItemText,
} from '../../components/Lists';
const MaxWidth = 200;
const MinWidth = 72;

type LeftNavProps = {
  expand: boolean;
} & DrawerProps;
const CustomLeftNav: React.SFC<LeftNavProps> = ({ expand, ...props }) => {
  return <MuiDrawer {...props} />;
};
const Left = styled<LeftNavProps>(CustomLeftNav)`
  && {
    height: 100%; // safari compatibility
  }
  .left-paper {
    position: relative;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    width: ${props => (props.expand ? MaxWidth : MinWidth)}px;
    justify-content: space-between;
    padding: ${spacing(6)} 0;
    box-sizing: border-box;
    transition: width 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
    // this group btns will awake
    &:hover {
      .nav-icon {
        color: ${grey('500')}; // 500
      }
      .nav-text span {
        color: ${grey('700')}; // 700
      }
    }
    &::-webkit-scrollbar {
      width: 0 !important;
    }
  }
`;

const StyledListItem = styled(JuiListItem)`
  && {
    padding: 0;
    height: ${height(11)};
    outline: none;
  }
  &&.selected {
    background: transparent;
  }
  // In order to make sure use tab switch nav
  &&.selected.left-item-focus {
    background: ${({ theme }) => theme.palette.action.active};
  }
  &&.left-item-focus {
    .left-link {
      span {
        color: ${grey('700')};
      }
      .nav-icon {
        color: ${grey('700')}; // 500
      }
    }
  }
  &&&:hover {
    background-color: ${({ theme, selected }) =>
      selected ? theme.palette.action.active : grey('100')};
    opacity: ${({ theme }) => 1 - theme.palette.action.hoverOpacity};
    .nav-icon {
      color: ${grey('500')}; // 500
    }
  }
`;
const StyledListItemText = styled(JuiListItemText)`
  && {
    color: ${grey('500')}; // 500
    padding: 0;
    span {
      color: ${palette('accent', 'ash')}; // Aah
      font-size: ${({ theme }) => `${theme.typography.fontSize}px`};
    }
  }
`;
const ListLink = styled.a`
  position: relative;
  outline: none;
  display: flex;
  height: 100%;
  padding: 0 ${spacing(5)};
  width: 100%;
  margin-left: ${({ theme }) => `${(theme.spacing.unit * 6) / 4}px`};
  align-items: center;
  text-decoration: none;
  &&&:active {
    opacity: ${({ theme }) => 1 - 2 * theme.palette.action.hoverOpacity};
    span,
    .nav-icon,
    .nav-text span {
      color: ${palette('primary', 'main')}; // RC Blue
    }
  }
  &&.active {
    && .nav-icon,
    && .nav-text span {
      color: ${palette('primary', 'main')}; // RC Blue
    }
  }
  .nav-icon {
    color: ${palette('accent', 'ash')};
    margin-right: ${spacing(8)};
  }
  .nav-text span {
    color: ${palette('accent', 'ash')};
  }
`;

const UmiWrapper = styled<{ expand: boolean }, 'div'>('div')`
  position: ${props => (!props.expand ? 'absolute' : 'static')};
  top: ${props => (!props.expand ? spacing(1) : '')};
  left: ${props => (!props.expand ? spacing(8) : '')};
`;

type JuiLeftNavProps = {
  expand: boolean;
  icons: {
    url: string;
    icon: string;
    title: string;
    umi?: JSX.Element;
  }[][];
  onRouteChange: Function;
  selectedPath: string;
};

class JuiLeftNav extends PureComponent<JuiLeftNavProps> {
  onRouteChangeHandlers: {
    [id: string]: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  } = {};

  onRouteChange = (url: string) => {
    if (this.onRouteChangeHandlers[url]) {
      return this.onRouteChangeHandlers[url];
    }
    this.onRouteChangeHandlers[url] = () => {
      const { onRouteChange } = this.props;
      onRouteChange(url);
    };
    return this.onRouteChangeHandlers[url];
  }

  renderNavItems = () => {
    const { icons, expand, selectedPath } = this.props;
    return icons.map((arr, idx) => {
      return (
        <MuiList component="nav" disablePadding={true} key={idx}>
          {arr.map((item, index) => {
            const navUrl = item.url;
            const navPath = navUrl.split('/')[1];
            const selected = selectedPath === navPath;
            const NavItem = (
              <StyledListItem
                button={true}
                key={index}
                selected={selected}
                classes={{ selected: 'selected' }}
                disableRipple={true}
                data-test-automation-id={item.url.slice(1)}
                focusVisibleClassName={'left-item-focus'}
                disableGutters={true}
              >
                <ListLink
                  className={`left-link ${selected ? 'active' : ''}`}
                  onClick={this.onRouteChange(navUrl)}
                >
                  <JuiListItemIcon className={'nav-icon'}>
                    <JuiIconography>{item.icon}</JuiIconography>
                  </JuiListItemIcon>
                  <StyledListItemText
                    primary={item.title}
                    className={'nav-text'}
                  />
                  <UmiWrapper expand={expand}>{item.umi}</UmiWrapper>
                </ListLink>
              </StyledListItem>
            );
            return !expand ? (
              <JuiArrowTip
                title={item.title}
                key={index}
                enterDelay={400}
                placement="right"
              >
                {NavItem}
              </JuiArrowTip>
            ) : (
              NavItem
            );
          })}
        </MuiList>
      );
    });
  }
  render() {
    const { expand } = this.props;
    return (
      <Left
        expand={expand}
        variant="permanent"
        classes={{ paper: 'left-paper' }}
        open={expand}
        data-test-automation-id="leftPanel"
      >
        {this.renderNavItems()}
      </Left>
    );
  }
}

export { JuiLeftNav, JuiLeftNavProps };
