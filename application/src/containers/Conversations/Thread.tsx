import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

interface IParams {
  id: string;
}

interface IProps extends RouteComponentProps<IParams> { }

const Thread = ({ match }: IProps) => {
  const id = parseInt(match.params.id, 10);
  return (
    <div>
      <strong>Conversation thread: </strong>
      <div>{!isNaN(id) ? `id: ${id}` : 'get last open conversation id'}</div>
    </div>
  );
};

export default withRouter(Thread);
