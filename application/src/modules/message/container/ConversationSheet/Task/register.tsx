/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 19:52:23
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { TypeDictionary } from 'sdk/utils';
import { Post } from 'sdk/module/post/entity';
import PostModel from '@/store/models/Post';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { Task, TaskUpdate } from './';

type Props = {
  ids: number[];
  postId: number;
};

export default {
  priority: 1,
  component: observer((props: Props) => {
    const { ids, postId } = props;
    const post = getEntity<Post, PostModel>(ENTITY_NAME.POST, postId);
    const { activityData } = post;

    if (activityData && activityData.key) {
      return <TaskUpdate ids={ids} postId={postId} />;
    }
    return <Task ids={ids} postId={postId} />;
  }),
  type: TypeDictionary.TYPE_ID_TASK,
  breakIn: true,
};
