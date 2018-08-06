import React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import Thread from '@/containers/Conversations/Thread';
import RightRail from '@/containers/Conversations/RightRail';

interface IProps extends RouteComponentProps<any> { }

const Content = ({ match }: IProps) => {
  const id = parseInt(match.params.id, 10);
  return (
    <div>
      conversation content:
      {id ? <span><Thread /><RightRail /></span> : <span>conversation home page</span>}
    </div>
  );
};

export default Content;
