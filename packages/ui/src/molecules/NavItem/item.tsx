import React from 'react';
import styled from 'styled-components';
import MuiListItem, { ListItemProps } from '@material-ui/core/ListItem';
import MuiListItemText, { ListItemTextProps } from '@material-ui/core/ListItemText';
import { WithTheme } from '@material-ui/core/styles/withTheme';
import { Umi } from '../../atoms';
import NavIcon from './icon';
import { NavLink } from 'react-router-dom';

type TListItem = {
  active: number,
  expand: number,
} & ListItemProps & Partial<Pick<WithTheme, 'theme'>>;
const CustomListItem: React.SFC<TListItem> = (props) => {
  return <MuiListItem {...props} />;
};
const ListItem = styled<TListItem>(CustomListItem).attrs({ className : 'left-list-item' })`
  && {
    padding: 0;
    height: ${({ theme }) => theme.spacing.unit * 11 + 'px'};
    outline: none;
  }
  // In order to make sure use tab switch nav
  &&.left-item-focus {
    .left-link {
       background: ${props => props.color};
       span {
          color: ${({ theme }) => theme.palette.grey[700]};
       }
       .nav-icon {
        color: ${({ theme }) => theme.palette.grey[700]}; // 500
     }
    }
  }
  &&:hover {
      background-color: ${props => props.active ? '#EBF6FA' : '#F5F5F5'};
      opacity: .88;
     .nav-icon {
        color: ${({ theme }) => theme.palette.grey[500]}; // 500
     }
  }
`;
type TListItemTextProps = {
  expand: number,
} & ListItemTextProps & Partial<Pick<WithTheme, 'theme'>>;

const CustomListItemText: React.SFC<TListItemTextProps> = (props) => {
  return <MuiListItemText {...props} />;
};
const ListItemText = styled<TListItemTextProps>(CustomListItemText)`
  && {
    font-size: 12px;
    color: ${({ theme }) => theme.palette.grey[500]}; // 500
    transform: translate3d(${props => props.expand ? 12 : -10}px, 0, 0);
    opacity: ${props => props.expand ? 1 : 0};
    transition: transform .2s ease, opacity .2s ease;
    padding: 0;
    span {
      color: ${({ theme }) => theme.palette.accent.ash}; // Aah
      transition: color .2s ease;
    }
  }
`;
type TUMIProps = {
  expand: number,
  unreadCount: number,
  important: boolean,
  variant: 'count' | 'dot' | 'auto',
};
const CustomUMI: React.SFC<TUMIProps> = (props) => {
  return <Umi {...props} />;
};
const UMI = styled<TUMIProps>(CustomUMI)`
  && {
    position: ${props => !props.expand ? 'absolute' : 'static'};
    top: ${props => !props.expand ? '6px' : ''};
    left: ${props => !props.expand ? '34px' : ''};
    border-radius: ${({ theme }) => theme.shape.borderRadius * 6 + 'px'};
    transition: opacity .2s ease;
    transform: scale(.85);
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
  align-items: center;
  text-decoration: none;
  &&:hover {
     background: ${props => props.color};
  }
  &&&:active {
    background: #D7EBF4 !important; // water
    opacity: .76;
    span, .nav-icon {
     color: ${({ theme, color }) => color ? theme.palette[color].main : '#0684BD'}; // RC Blue
    }
  }
  &&.active {
    && .nav-icon, && .nav-text span {
      color: ${({ theme, color }) => color ? theme.palette[color].main : '#0684BD'}; // RC Blue
    }
  }
`;
type TNavItemProps = {
  expand: number;
  title?: string;
  active: number;
  icon: string;
  variant: 'count' | 'dot' | 'auto',
  url?: string;
  unreadCount: number;
} & Partial<Pick<WithTheme, 'theme'>>;

const Item = ((props: TNavItemProps) => {
  const { expand, active, title, variant, unreadCount, icon, url } = props;
  const bgColor = active ? '#EBF6FA' : '#F5F5F5'; // Ice and 100
  return (
    <ListItem
      button={true}
      tabIndex={-1}
      active={active}
      data-author={title}
      disableRipple={true}
      focusVisibleClassName={'left-item-focus'}
      disableGutters={true}
      color={bgColor}
      expand={expand}
    >
      <ListLink to={`/${url}`} className={'left-link'}>
        <NavIcon component={icon} active={active} className={'nav-icon'} />
        <ListItemText expand={expand} className={'nav-text'}>{title}</ListItemText>
        <UMI unreadCount={unreadCount} important={true} expand={expand} variant={variant} />
      </ListLink>
    </ListItem>
  );
});
export const NavItem = styled<TNavItemProps>(Item)``;
export default NavItem;
