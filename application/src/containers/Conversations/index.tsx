import React from 'react';

import TreeLayout from '../Layout/TreeLayout';
import LeftRail from './LeftRail';
import Thread from './Thread';
import RightRail from './RightRail';

const Conversation = () => {
  return (
    <TreeLayout>
      <LeftRail />
      <Thread />
      <RightRail />
    </TreeLayout>
  );
};

export default Conversation;
