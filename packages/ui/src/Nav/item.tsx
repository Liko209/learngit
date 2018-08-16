import React from 'react';
import styled from 'styled-components';
import MuiListItem, { ListItemProps } from '@material-ui/core/ListItem';
import MuiListItemText, { ListItemTextProps } from '@material-ui/core/ListItemText';
import { WithTheme } from '@material-ui/core/styles/withTheme';
import { Umi } from '../atoms';
import NavIcon from './icon';

type TListItem = {
  // tabIndex: string,
  isExpand: boolean,
} & ListItemProps & Partial<Pick<WithTheme, 'theme'>>;
const CustomListItem: React.SFC<TListItem> = (props) => {
  return <MuiListItem {...props} />;
};
const ListItem = styled<TListItem>(CustomListItem).attrs({ className : 'left-list-item' })`
  && {
    position: relative;
    padding-left: 20px;
    padding-right: 20px;
    height: 48px;
    outline: none;
    width: ${ props => props.isExpand ? '100%' : '70px'}
  }
  // In order to make sure use tab switch nav
  &.left-item-focus {
    .left-link {
       background: ${props => props.color};
    }
  }
  &&:hover {
      background-color: #f5f5f5;
     .left-icon {
        color: #9e9e9e; // 500
     }
  }
`;
type TListItemTextProps = {
  isExpand: boolean,
} & ListItemTextProps & Partial<Pick<WithTheme, 'theme'>>;

const CustomListItemText: React.SFC<TListItemTextProps> = (props) => {
  return <MuiListItemText {...props} />;
};
const ListItemText = styled<TListItemTextProps>(CustomListItemText)`
  && {
    font-size: 12px;
    color: #9e9e9e; // 500
    transform: translate3d(${props => props.isExpand ? 12 : -10}px, 0, 0);
    opacity: ${props => props.isExpand ? 1 : 0};
    transition: transform .2s ease, opacity .2s ease;
    padding: 0;
    span {
      color: #bfbfbf; // Aah
      transition: color .2s ease;
    }
  }
`;
type TUMIProps = {
  isExpand: boolean,
  unreadCount: number,
  important: boolean,
  showCount: boolean,
};
const UMI = styled<TUMIProps>(Umi)`
  && {
    margin-top: ${props => !props.isExpand ? '-18px' : '0'};
    margin-left: ${props => !props.isExpand ? '-6px' : '0'};
    width: auto;
    height: auto;
    padding: 1px 5px;
    border-radius: 12px;
    transition: opacity .2s ease;
    transform: scale(.85)
  }
`
type TNavItemProps = {
  expand: boolean;
  url?: string;
  type?: string;
  title?: string;
  active: boolean;
  icon: string;
  showCount: boolean;
  num?: number;
  unreadCount: number;
} & Partial<Pick<WithTheme, 'theme'>>;

const NavItem = ((props: TNavItemProps) => {
  const { expand, active, title, showCount, unreadCount, icon } = props;
  const bgColor = '#EBF6FA'; // Ice and 100
  return (
    <ListItem
      button={true}
      disableRipple={true}
      focusVisibleClassName={'left-item-focus'}
      disableGutters={true}
      color={bgColor}
      isExpand={expand}
    >
      <NavIcon component={icon} active={active} />
      <ListItemText isExpand={expand}>{title}</ListItemText>
      <UMI unreadCount={unreadCount} important={true} isExpand={expand} showCount={showCount} />
    </ListItem>
  );
});
export const Item = styled<TNavItemProps>(NavItem)``;
export default Item;
