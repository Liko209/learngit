import React from 'react';
import { withRouter, NavLink, RouteComponentProps } from 'react-router-dom';
import FavoriteSection from './FavoriteSection';

interface IProps extends RouteComponentProps<any> { }

const List = ({ match }: IProps) => {
  return (
    <div>
      <FavoriteSection />
      <strong>Conversation list: </strong>
      <NavLink to="/messages/123">123 </NavLink>
      <NavLink to="/messages/456">456 </NavLink>
      <NavLink to="/messages/789">789 </NavLink>
    </div>
  );
};

export default withRouter(List);
