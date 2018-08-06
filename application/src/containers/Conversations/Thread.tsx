import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

interface IProps extends RouteComponentProps<any> { }

const Thread = ({ match }: IProps) => {
  return (
    <div>
      <div>Conversation thread id {match.params.id}</div>
    </div>
  );
};

export default withRouter(Thread);
