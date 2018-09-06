import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { ConversationStream } from '@/containers/Conversations/ConversationPage/ConversationStream';

interface IParams {
  id: string;
}

interface IProps extends RouteComponentProps<IParams> { }

const Thread = ({ match }: IProps) => {
  const id = parseInt(match.params.id, 10);
  return (
    <div style={{ backgroundColor: '#fff', height: '100%' }}>
      <strong>Conversation thread: {id} </strong>
      <div style={{ height: '100%', display: 'flex' }}>{!isNaN(id) ? <ConversationStream groupId={id} /> : null}</div>
    </div>
  );
};

export default withRouter(Thread);
