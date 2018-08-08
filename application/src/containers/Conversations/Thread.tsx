import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

interface IProps extends RouteComponentProps<any> { }

const Thread = ({ match }: IProps) => {
  return (
    <div>
      <strong>Conversation thread: </strong>
      <span>id: {match.params.id}</span>
    </div>
  );
};

export default withRouter(Thread);
