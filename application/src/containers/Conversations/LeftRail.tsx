import React from 'react';
import { withRouter, NavLink, RouteComponentProps } from 'react-router-dom';

interface IProps extends RouteComponentProps<any> { }

const List = ({ match }: IProps) => {
  return (
    <div>
      <strong>Conversation list: </strong>
      <NavLink to={`${match.url}/123`}>123 </NavLink>
      <NavLink to={`${match.url}/456`}>456 </NavLink>
      <NavLink to={`${match.url}/789`}>789 </NavLink>
    </div>
  );
};

export default withRouter(List);
