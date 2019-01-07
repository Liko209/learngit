import React from 'react';
import { observer } from 'mobx-react';
// import { autorun } from 'mobx';
import { TypeDictionary } from 'sdk/utils';
import { Post } from 'sdk/module/post/entity';
import PostModel from '@/store/models/Post';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { Event, EventUpdate } from './';

type Props = {
  ids: number[];
  postId: number;
};

export default {
  priority: 0,
  component: observer((props: Props) => {
    const { ids, postId } = props;
    const post = getEntity<Post, PostModel>(ENTITY_NAME.POST, postId);
    const { activityData } = post;
    if (activityData && activityData.object_id) {
      return <EventUpdate ids={ids} postId={postId} />;
    }
    return <Event ids={ids} />;
  }),
  type: TypeDictionary.TYPE_ID_EVENT,
};
