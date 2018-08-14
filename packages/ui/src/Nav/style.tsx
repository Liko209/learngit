import MuiList from '@material-ui/core/List/index';
import styled from 'styled-components';
import MuiDrawer from '@material-ui/core/Drawer/index';
import MuiListItem, { ListItemProps }  from '@material-ui/core/ListItem';
import MuiListItemText from '@material-ui/core/ListItemText';
import MuiBadge from '@material-ui/core/Badge';
import { NavLink } from 'react-router-dom';
import { WithTheme } from '@material-ui/core';

const MaxWidth = 200;
const MinWidth = 72;

const List = styled(MuiList).attrs({ className:'left-list' })`
  &:first-child {
    .left-list-item {
      .left-icon {
        margin: 0 0 0 3px;
      }
    }
  }
  &:nth-last-child(1) {
    .left-list-item {
      height: 40px;
      .left-icon {
        font-size: 18px;
        margin: 0 0 0 6px;
      }
    }
  }
`;

const Drawer = styled(MuiDrawer)`
  && {
    flex: auto;
    display:flex;
    width: ${props => props.open ? MaxWidth : MinWidth}px;
    height: 100%;
    transition: all .25s ease;
  }
  .left-paper {
    position: relative;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    width: ${props => props.open ? MaxWidth : MinWidth}px;
    justify-content: space-between;
    padding: 24px 0;
    box-sizing: border-box;
    transition: all .25s ease;
    // this group btns will awake
    &:hover {
      .left-icon {
        color: #9e9e9e; // 500
      }
      span {
        color: #616161; // 700
      }
    }
  }
`;
export type TListItemProps = {
  tabIndex: string,
} & ListItemProps & Partial<Pick<WithTheme, 'theme'>>;
// item.tsx
const ListItem = styled(MuiListItem).attrs({ className : 'left-list-item' })`
  && {
    padding: 0;
    height: 48px;
    outline: none;
  }
  // In order to make sure use tab switch nav
  &.left-item-focus {
    .left-link {
       background: ${props => props.color};
    }
  }
  &&:hover {
     // In order to make sure if active state it will be active's color
     // or hover's color
     .left-icon {
        color: #9e9e9e; // 500
     }
  }
`;

const ListItemText = styled(MuiListItemText)`
  && {
    font-size: 12px;
    color: #9e9e9e; // 500
    transform: translate3d(${props => props.open ? 12 : -10}px, 0, 0);
    opacity: ${props => props.open ? 1 : 0};
    transition: transform .2s ease, opacity .2s ease;
    padding: 0;
    span {
      color: #bfbfbf; // Aah
      transition: color .2s ease;
    }
  }
`;

const ListLink = styled(NavLink)`
  display:flex;
  outline: none;
  padding: 0 20px;
  height: 100%;
  width: 100%;
  align-items: center;
  &&:hover {
     background: ${props => props.color};
  }
  &&&:active {
    background: #D7EBF4 !important; // water
    span, .left-icon {
     color: #0684BD; // RC Blue
    }
  }
  &&.active {
    && .left-icon, && span {
      color: #0684BD; // RC Blue
    }
  }
`;

const BaseBadge = styled(MuiBadge)`
    span {
      ${props => !props.num ? `
        height: 8px;
        width: 8px;
        border-radius:50%
      ` : `
        width: auto;
        height: auto;
        padding: 1px 5px;
        border-radius: 12px;
        transform: scale(.85);
      `};
      opacity: ${props => props.open ? 0 : 1};
      transition: opacity .2s ease;
      background: #FF8800; // RC orange
      border: 1px solid #fff;
      color: #fff !important;
      box-sizing: border-box;
      display: ${props => props.type ? 'block' : 'none'};
    }
`;

const Badge = styled(BaseBadge)`
    span {
      ${props => props.num ? `
        top: -8px;
        left: 18px;
        right: auto;
      ` : `
        left: 20px;
        top: -4px;
      `};
    }
`;

const RightBadge = styled(BaseBadge)`
    span {
      ${props => props.num ? `
        top: -10px;
        right: -3px;
      ` : `
        right: 0px;
        top: -5px;
      `};
    }
`;
export { List, Drawer, ListItem, ListItemText, ListLink, BaseBadge, Badge, RightBadge };
