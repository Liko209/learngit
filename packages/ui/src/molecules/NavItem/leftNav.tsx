import styled from 'styled-components';
import React from 'react';
import { NavItem } from './item';
import MuiList from '@material-ui/core/List/index';
import MuiDrawer, { DrawerProps } from '@material-ui/core/Drawer/index';
import { WithTheme } from '@material-ui/core/styles/withTheme';

const MaxWidth = 200;
const MinWidth = 72;

type TLeftNav = {
  expand: number,
} & DrawerProps & Partial<Pick<WithTheme, 'theme'>>;
const CustomLeftNav: React.SFC<TLeftNav> = (props) => {
  return <MuiDrawer {...props} />;
};
const Left = styled<TLeftNav>(CustomLeftNav)`
  && {
    display:flex;
    width: ${props => props.expand ? MaxWidth : MinWidth}px;
    height: 100%;
    transition: all .25s ease;
  }
  .left-paper {
    position: relative;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    width: ${props => props.expand ? MaxWidth : MinWidth}px;
    justify-content: space-between;
    padding: 24px 0;
    box-sizing: border-box;
    transition: all .25s ease;
    // this group btns will awake
    &:hover {
     .nav-icon {
       color: ${({ theme }) => theme.palette.grey[500]}; // 500
     }
     .nav-text span {
       color: ${({ theme }) => theme.palette.grey[700]}; // 700
     }
   }
  }
`;

const Icons = [
  ['Dashboard', 'Messages', 'Phone', 'Meetings'],
  ['Contacts', 'Calendar', 'Tasks', 'Notes', 'Files', 'Settings'],
];
type TNavProps = {
  isExpand: boolean,
} & Partial<Pick<WithTheme, 'theme'>>;

const UMICount = [120, 0, 16, 1, 0, 1, 99, 0, 11];
export const LeftNav = (props: TNavProps) => {
  const isExpand = props.isExpand;
  return (
    <Left expand={+isExpand} variant="permanent" classes={{ paper: 'left-paper' }}>
    {Icons.map((arr, index) => {
      return (
        <MuiList
          component="nav"
          disablePadding={true}
          key={index}
        >
          {
            arr.map((item, idx) => {
              const navUrl = item.toLocaleLowerCase();
              const isActive = window.location.pathname.slice(1) === navUrl;
              const umiType = UMICount[idx];
              return (<NavItem
                expand={+isExpand}
                url={navUrl}
                active={+isActive}
                icon={item}
                title={item}
                key={idx}
                variant="count"
                unreadCount={umiType}
              />);
            })
          }
        </MuiList>
      );
    })}
  </Left>
  );
};
