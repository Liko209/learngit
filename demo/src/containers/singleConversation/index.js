/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-07-02 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';

import { withRouter } from 'react-router-dom';
import Left from '@/components/Conversation/Left';
import Right from '@/components/Conversation/Right';
import Posts from '@/containers/Posts';
import Members from '@/containers/Members';
import TeamDescription from '@/containers/TeamDescription';
import Header from '@/containers/Conversation/Header';
import PostEditor from '@/containers/PostEditor';
import RightRailItems from '@/containers/RightRailItems/index';
// import BottomRightVersionStatus from '@/containers/Status/bottomRight';
import styled from 'styled-components';
import SplitPane from '@/components/SplitPane';

const ConversationWrap = styled(SplitPane) `
  display: flex;
  width: 100%;
  flex-direction: row;
`;
const SingleConversation = () => (
  <ConversationWrap>
    <Left>
      <Header />
      <Posts />
      <PostEditor />
    </Left>
    <Right>
      <Members />
      <TeamDescription />
      <RightRailItems />
      {/* <BottomRightVersionStatus /> */}
    </Right>
  </ConversationWrap>
);

export default withRouter(SingleConversation);
