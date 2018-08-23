import React from 'react';
import { withRouter, NavLink } from 'react-router-dom';

const List = () => {
  return (
    <div style={{ backgroundColor: 'green', height: '100%' }}>
      <strong>Conversation list: </strong>
      <NavLink to="/messages/123">123 </NavLink>
      <NavLink to="/messages/456">456 </NavLink>
      <NavLink to="/messages/789">789 </NavLink>
    </div>
  );
};

export default withRouter(List);
