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
    position: absolute;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    width: ${props => props.expand ? MaxWidth : MinWidth}px;
    justify-content: space-between;
    padding: ${({ theme }) => theme.spacing.unit * 6 + 'px'} 0;
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
  isExpand: boolean;
  id: string;
  umiCount: number[];
  icons: {
    icon: string,
    title: string,
  }[][];
} & Partial<Pick<WithTheme, 'theme'>>;
export const LeftNav = (props: TNavProps) => {
  const { isExpand, icons, umiCount } = props;
  return (
    <Left expand={+isExpand} variant="permanent" classes={{ paper: 'left-paper' }} data-anchor="left-panel" id={props.id}>
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
                const isActive = window.location.pathname.slice(1) === navUrl;
                const umiType = umiCount[idx];
                return (<NavItem
                  expand={+isExpand}
                  url={navUrl}
                  active={+isActive}
                  icon={item.icon}
                  title={item.title}
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
