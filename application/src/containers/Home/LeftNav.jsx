import styled from 'styled-components';
import React from 'react';
import { NavItem } from 'ui-components';
import {  NavLink } from 'react-router-dom';

const MaxWidth = 200;
const MinWidth = 72;
const LeftNav = styled.div`
  background-color: #fff;
  width: ${props => props.expand ? MaxWidth : MinWidth}px;;
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  position: relative;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
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
`;
const Gap = styled.div`
  margin-top: 220px;
`
const ListLink = styled(NavLink)`
  outline: none;
  text-decoration: none;
  &&&:active {
    background: #D7EBF4 !important; // water
    span, .nav-icon {
     color: #0684BD; // RC Blue
    }
  }
  &&.active {
    && .nav-icon, && .nav-text span {
      color: #0684BD; // RC Blue
    }
  }
`;
const topIcons = ['Dashboard','Messages', 'Calls','Meetings']
const bottomIcons = ['Calendar', 'Tasks', 'Notes','Files'];
export default (props) => {
  const isExpand = props.isExpand;
  return <LeftNav expand={isExpand}>
    {topIcons.map((item1, index) => {
      const navUrl = item1.toLocaleLowerCase();
      const isActive = window.location.pathname.slice(1) === navUrl;
      return  <ListLink to={`/${navUrl}`} key={index}>
        <NavItem
          expand={+isExpand}
          active={+isActive}
          icon={item1}
          title={item1}
          showCount={false}
          unreadCount={1}
        />
      </ListLink>
    })}
    <Gap />
    {
      bottomIcons.map((item2, index) => {
        const navUrl = item2.toLocaleLowerCase();
        const isActive = window.location.pathname.slice(1) === navUrl;
        return <ListLink to={`/${navUrl}`} key={index}>
          <NavItem
            expand={+isExpand}
            active={+isActive}
            icon={item2}
            title={item2}
            showCount={true}
            unreadCount={929}
          />
        </ListLink>
      })
    }
  </LeftNav>;
};
