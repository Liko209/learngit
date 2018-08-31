/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-8-22 11:12:02
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import MuiListItem, { ListItemProps } from '@material-ui/core/ListItem';
import { NavLink } from 'react-router-dom';
import MuiListItemText, {
  ListItemTextProps,
} from '@material-ui/core/ListItemText';
import { Umi, ArrowTip } from '../../atoms';
import NavIcon from './icon';
import styled from '../../styled-components';

type TListItem = {
  active: boolean;
  expand: boolean;
} & ListItemProps;
const CustomListItem: React.SFC<TListItem> = ({ active, expand, ...props }) => {
  return <MuiListItem {...props} />;
};
const ListItem = styled<TListItem>(CustomListItem).attrs({
  className: 'left-list-item',
})`
  && {
    padding: 0;
    height: ${({ theme }) => theme.size.height * 44 / 10 + 'px'};
    outline: none;
  }
  // In order to make sure use tab switch nav
  &&.left-item-focus {
    .left-link {
      span {
        color: ${({ theme }) => theme.palette.grey[700]};
      }
      .nav-icon {
        color: ${({ theme }) => theme.palette.grey[700]}; // 500
      }
    }
  }
  &&:hover {
    background-color: ${({ theme, active }) => active ? theme.palette.action.active : theme.palette.grey[100]};
    opacity: ${({ theme }) => 1 - theme.palette.action.hoverOpacity};
    .nav-icon {
      color: ${({ theme }) => theme.palette.grey[500]}; // 500
    }
  }
`;
type TListItemTextProps = {
  expand: boolean;
} & ListItemTextProps;

const CustomListItemText: React.SFC<TListItemTextProps> = ({ expand, ...props }) => {
  return <MuiListItemText {...props} />;
};
const ListItemText = styled<TListItemTextProps>(CustomListItemText)`
  && {
    color: ${({ theme }) => theme.palette.grey[500]}; // 500
    transform: translate3d(${props => (props.expand ? 12 : -10)}px, 0, 0);
    opacity: ${props => (props.expand ? 1 : 0)};
    transition: transform 0.2s ease, opacity 0.2s ease;
    padding: 0;
    span {
      color: ${({ theme }) => theme.palette.accent.ash}; // Aah
      transition: color 0.2s ease;
      font-size: ${({ theme }) => theme.typography.fontSize + 'px'};
    }
  }
`;
type TUMIProps = {
  expand: boolean;
  unreadCount: number;
  important: boolean;
  variant: 'count' | 'dot' | 'auto';
};
const CustomUMI: React.SFC<TUMIProps> = (props) => {
  return <Umi {...props} />;
};
const UMI = styled<TUMIProps>(CustomUMI)`
  && {
    position: ${props => (!props.expand ? 'absolute' : 'static')};
    top: ${props => (!props.expand ? '6px' : '')};
    left: ${props => (!props.expand ? '34px' : '')};
    border-radius: ${({ theme }) => theme.shape.borderRadius * 6 + 'px'};
    transition: opacity 0.2s ease;
    transform: scale(0.85);
    color: #fff !important;
  }
`;
const ListLink = styled(NavLink)`
  position: relative;
  outline: none;
  display: flex;
  height: 100%;
  padding: 0 ${({ theme }) => theme.spacing.unit * 5 + 'px'};
  width: 100%;
  margin-left: ${({ theme }) => theme.spacing.unit * 6 / 4 + 'px'};
  align-items: center;
  text-decoration: none;
  &&&:active {
    opacity: ${({ theme }) => 1 - 2 * theme.palette.action.hoverOpacity};
    span,
    .nav-icon {
      color: ${({ theme }) => theme.palette.primary.main}; // RC Blue
    }
  }
  &&.active {
    && .nav-icon,
    && .nav-text span {
      color: ${({ theme }) => theme.palette.primary.main}; // RC Blue
    }
  }
`;
export type TNavItemProps = {
  expand: boolean;
  title?: string;
  active: boolean;
  icon: string;
  variant: 'count' | 'dot' | 'auto';
  url?: string;
  unreadCount: number;
  invert?: boolean;
};

const NavItem = (props: TNavItemProps) => {
  const { expand, active, title, variant, unreadCount, icon, url } = props;
  const NavItems = (
    <ListItem
      button={true}
      tabIndex={-1}
      active={active}
      data-anchor={title}
      disableRipple={true}
      focusVisibleClassName={'left-item-focus'}
      disableGutters={true}
      expand={expand}
    >
      <ListLink to={`/${url}`} className={'left-link'}>
        <NavIcon component={icon} active={active} className={'nav-icon'} />
        <ListItemText expand={expand} className={'nav-text'}>
          {title}
        </ListItemText>
        <UMI
          unreadCount={unreadCount}
          important={true}
          expand={expand}
          variant={variant}
        />
      </ListLink>
    </ListItem>
  );
  return !expand ? (
    <ArrowTip
      title={title}
      enterDelay={400}
      placement="top"
      node={NavItems}
    />
  ) : (
    NavItems
  );
};
export default NavItem;
