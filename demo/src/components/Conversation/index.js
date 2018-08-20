/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-02-27 10:35:21
 */
import React from 'react';

import { withRouter } from 'react-router-dom';

import Posts from '#/containers/Posts';
import Members from '#/containers/Members';
import TeamDescription from '#/containers/TeamDescription';
import Header from '#/containers/Conversation/Header';
import PostEditor from '#/containers/PostEditor';
import SplitPaneWrapper from './SplitPaneWrapper';
import Left from './Left';
import Right from './Right';
import RightRailItems from '#/containers/RightRailItems/index';
import BottomRightVersionStatus from '#/containers/Status/bottomRight';

const Conversation = () => (
  <SplitPaneWrapper
      primary="second"
      defaultSize={285}
      minSize={175}
      maxSize={400}
  >
    <Left>
      <Header />
      <Posts />
      <PostEditor />
    </Left>
    <Right>
      <Members />
      <TeamDescription />
      <RightRailItems />
      <BottomRightVersionStatus />
    </Right>
  </SplitPaneWrapper>
);

export default withRouter(Conversation);
