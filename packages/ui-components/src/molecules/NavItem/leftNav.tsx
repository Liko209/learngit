/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-8-23 10:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import styled from '../../styled-components';
import React, { PureComponent } from 'react';
import NavItem from './item';
import MuiList from '@material-ui/core/List/index';
import MuiDrawer, { DrawerProps } from '@material-ui/core/Drawer/index';

const MaxWidth = 200;
const MinWidth = 72;

type TLeftNav = {
  expand: boolean,
} & DrawerProps;
const CustomLeftNav: React.SFC<TLeftNav> = ({ expand, ...props }) => {
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
    position: absolute;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    width: ${props => props.expand ? MaxWidth : MinWidth}px;
    justify-content: space-between;
    padding: ${({ theme }) => `${theme.spacing.unit * 6}px`} 0;
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
   &::-webkit-scrollbar {
      width: 0 !important;
    }
  }
`;

type TNavProps = {
  expanded: boolean;
  id: string;
  umiCount: any[];
  handleTitle?: Function;
  handleRouterChange?: ((event: React.MouseEvent<HTMLAnchorElement>) => void);
  icons: {
    icon: string,
    title: string,
  }[][];
};
class LeftNav extends PureComponent<TNavProps>{
  render() {
    const { expanded, icons, umiCount, handleTitle, handleRouterChange, id } = this.props;
    return (
     <Left expand={expanded} variant="permanent" classes={{ paper: 'left-paper' }} data-anchor="left-panel" id={id}>
       {icons.map((arr, index) => {
         return (
           <MuiList
             component="nav"
             disablePadding={true}
             key={index}
           >
             {
               arr.map((item, idx) => {
                 const navUrl = item.icon.toLocaleLowerCase();
                 const isActive = new RegExp(window.location.pathname.slice(1)).test(navUrl);
                 const umiType = umiCount.length ? umiCount[idx] : 0;
                 return (<NavItem
                   expand={expanded}
                   url={navUrl}
                   active={isActive}
                   icon={item.icon}
                   title={item.title}
                   key={idx}
                   handleRouterChange={handleRouterChange}
                   handleTitle={handleTitle}
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
  }
}
export { LeftNav };
