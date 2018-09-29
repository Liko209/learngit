/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-8-23 10:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import MuiList from '@material-ui/core/List/index';
import MuiDrawer, { DrawerProps } from '@material-ui/core/Drawer/index';
import { NavLink } from 'react-router-dom';
import styled from '../../foundation/styled-components';
import { JuiIconography } from '../../foundation/Iconography';
import { JuiUmi, JuiArrowTip } from '../../components/index';
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
  .left-paper {
    position: absolute;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    width: ${props => (props.expand ? MaxWidth : MinWidth)}px;
    justify-content: space-between;
    padding: ${spacing(6)} 0;
    box-sizing: border-box;
    transition: all 0.3s cubic-bezier(.25,.1,.25,1.0);
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
  // In order to make sure use tab switch nav
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
  &&:hover {
    background-color: ${({ theme, active }) => active ? theme.palette.action.active : grey('100')};
    opacity: ${({ theme }) => 1 - theme.palette.action.hoverOpacity};
    .nav-icon {
      color: ${grey('500')}; // 500
    }
  }
`;
const StyledListItemText = styled(JuiListItemText)`
  && {
    color: ${grey('500')}; // 500
    transition: transform 0.3s cubic-bezier(.25,.1,.25,1.0), opacity 0.3s cubic-bezier(.25,.1,.25,1.0);
    padding: 0;
    span {
      color: ${palette('accent', 'ash')}; // Aah
      transition: color 0.3s cubic-bezier(.25,.1,.25,1.0);
      font-size: ${({ theme }) => `${theme.typography.fontSize}px`};
    }
  }
`;
const ListLink = styled(NavLink)`
  position: relative;
  outline: none;
  display: flex;
  height: 100%;
  padding: 0 ${spacing(5)};
  width: 100%;
  margin-left: ${({ theme }) => `${theme.spacing.unit * 6 / 4}px`};
  align-items: center;
  text-decoration: none;
  &&&:active {
    opacity: ${({ theme }) => 1 - 2 * theme.palette.action.hoverOpacity};
    span,
    .nav-icon, .nav-text span {
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
type TUMIProps = {
  expand: boolean;
  unreadCount: number;
  important: boolean;
  variant: 'count' | 'dot' | 'auto';
};
const CustomUMI: React.SFC<TUMIProps> = (props) => {
  return <JuiUmi {...props} />;
};
const UMI = styled<TUMIProps>(CustomUMI)`
  && {
    position: ${props => (!props.expand ? 'absolute' : 'static')};
    top: ${props => (!props.expand ? spacing(1) : '')};
    left: ${props => (!props.expand ? spacing(8) : '')};
    border-radius: ${({ theme }) => `${theme.shape.borderRadius * 6}px`};
    transition: opacity 0.3s cubic-bezier(.25,.1,.25,1.0);
    transform: scale(0.85);
    color: #fff !important;
  }
`;
type TNavProps = {
  expand: boolean;
  unreadCount: number[][];
  icons: {
    icon: string;
    title: string;
  }[][];
};
class LeftNav extends PureComponent<TNavProps> {
  render() {
    const {
      icons,
      expand,
      unreadCount,
    } = this.props;
    return (
      <Left
        expand={expand}
        variant="permanent"
        classes={{ paper: 'left-paper' }}
        data-anchor="left-panel"
      >
        {icons.map((arr, idx) => {
          return (
            <MuiList component="nav" disablePadding={true} key={idx}>
              {
                arr.map((item, index) => {
                  const navUrl = item.icon.toLocaleLowerCase();
                  const pathname = window.location.pathname;
                  const actIndex = pathname.lastIndexOf('/');
                  const pathSlice = actIndex
                    ? pathname.slice(1, actIndex)
                    : pathname.slice(1);
                  const isActive = pathSlice === navUrl;
                  const unread = unreadCount[idx][index];
                  const NavItem = (
                    <StyledListItem
                      button={true}
                      key={index}
                      active={isActive}
                      disableRipple={true}
                      focusVisibleClassName={'left-item-focus'}
                      disableGutters={true}
                    >
                      <ListLink to={`/${navUrl}`} className={'left-link'}>
                        <JuiListItemIcon className={'nav-icon'}>
                          <JuiIconography>{item.icon}</JuiIconography>
                        </JuiListItemIcon>
                        <StyledListItemText primary={item.title} className={'nav-text'} />
                        <UMI
                          unreadCount={unread}
                          important={true}
                          expand={expand}
                          variant="count"
                        />
                      </ListLink>
                    </StyledListItem>
                  );
                  return !expand ?
                    <JuiArrowTip
                      title={item.title}
                      key={index}
                      enterDelay={400}
                      placement="bottom"
                    >
                      {NavItem}
                    </JuiArrowTip> : NavItem;
                })
              }
            </MuiList>
          );
        })}
      </Left>
    );
  }
}
export { LeftNav };
