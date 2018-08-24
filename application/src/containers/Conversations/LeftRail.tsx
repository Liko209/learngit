import React from 'react';
import { withRouter, NavLink } from 'react-router-dom';

const List = () => {
  return (
    <div style={{ backgroundColor: '#fff', height: '100%', borderRight: '1px solid #ddd' }}>
      <strong>Conversation list: </strong>
      <NavLink to="/messages/123">123 </NavLink>
      <NavLink to="/messages/456">456 </NavLink>
      <NavLink to="/messages/789">789 </NavLink>
    </div>
  );
};

export default withRouter(List);
