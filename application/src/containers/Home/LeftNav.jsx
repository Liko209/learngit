import styled from 'styled-components';
import React from 'react';
import { NavItem } from 'ui-components';
import MuiList from "@material-ui/core/List/index";
import MuiDrawer from "@material-ui/core/Drawer/index";

const MaxWidth = 200;
const MinWidth = 72;
const LeftNav = styled(MuiDrawer)`
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
       color: #9e9e9e; // 500
     }
     .nav-text span {
       color: #616161; // 700
     }
   }
  }
`;

const Icons = [['Dashboard','Messages', 'Phone','Meetings'],['Calendar', 'Tasks', 'Notes','Files']];
const UMICount = [120,0,16,1,0,1,99,0,11,12];
export default (props) => {
  const isExpand = props.isExpand;
  return <LeftNav expand={+isExpand} variant="permanent" classes={{paper: 'left-paper'}}>
    {Icons.map((arr, index) => {
      return (
        <MuiList component="nav"
              disablePadding={true}
              key={index}
        >
          {
            arr.map((item,idx) => {
              const navUrl = item.toLocaleLowerCase();
              const isActive = window.location.pathname.slice(1) === navUrl;
              let umiType = UMICount[idx]
              return (<NavItem
                expand={+isExpand}
                url={navUrl}
                active={+isActive}
                icon={item}
                title={item}
                key={idx}
                variant='count'
                unreadCount={umiType}
              />)
          })
          }
        </MuiList>
      )
    })}
  </LeftNav>;
};
