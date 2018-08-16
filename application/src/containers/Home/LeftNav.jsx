import styled from 'styled-components';
import React from 'react';
import { NavItem } from 'ui-components';
import { RouteComponentProps, NavLink, Switch, Route, Redirect } from 'react-router-dom';

const Left = styled.div`
  background-color: #fff;
  width: 200px;
`;
const Gap = styled.div`
  margin-top: 180px;
`

const icons1 = ['dashboard','messages', 'calls','meetings']
const icons2 = ['calendar', 'tasks', 'notes','files'];
export default (props) => {
  return <Left>
    {icons1.map((item1, index) => {
      return  <NavItem
        expand={true}
        url="sdsd"
        active={false}
        icon={item1}
        title={item1}
        showCount={true}
        unreadCount={22}
      />
    })}
    <Gap />
    {
      icons2.map((item2) => {
        return (
          <NavItem
            expand={true}
            url="sdsd"
            active={false}
            icon={item2}
            title={item2}
            showCount={true}
            unreadCount={22}
          />
        )
      })
    }
  </Left>;
};
