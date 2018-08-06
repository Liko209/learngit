import React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import Thread from '@/containers/Conversations/Thread';
import RightRail from '@/containers/Conversations/RightRail';

interface IProps extends RouteComponentProps<any> { }

const Content = ({ match }: IProps) => {
  const id = parseInt(match.params.id, 10);
  if (id) {
    return (
      <div>
        <strong>conversation content: </strong>
        <Thread />
        <RightRail />
      </div>
    );
  }
  return (
    <div>
      <strong>conversation content: </strong>
      <span>home page (get recent id)</span>
    </div>
  );
};

export default Content;
