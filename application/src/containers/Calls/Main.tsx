import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

interface IProps extends RouteComponentProps<any> { }

const Main = ({ match }: IProps) => {
  return (
    <div>
      <strong>Calls main page: </strong>
      <span>url: {match.url}</span>
    </div>
  );
};

export default withRouter(Main);
