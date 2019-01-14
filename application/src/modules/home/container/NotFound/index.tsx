import React from 'react';
import { RouteComponentProps } from 'react-router-dom';

interface IProps extends RouteComponentProps<any> { }

const NotFound = ({ location }: IProps) => (
  <div>
    No match for <code>{location.pathname}</code>
  </div>
);

export default NotFound;
