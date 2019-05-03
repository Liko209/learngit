import PostModel from '@/store/models/Post';
import config from '../config';

export const getActivityData = (post: PostModel) => {
  const activity = {};
  const { itemTypeIds } = post;
  if (itemTypeIds) {
    Object.keys(itemTypeIds).forEach((type: string) => {
      if (config[type]) {
        const props = {
          ...post,
          ids: itemTypeIds[type],
        };
        activity[type] = config[type](props);
      }
    });
  }
  return activity;
};

export const getActivity = (post: PostModel, activityData: object) => {
  const { parentId } = post;
  const types = Object.keys(activityData);
  let activity: any = {};
  switch (true) {
    case types.length > 1:
      activity = config.items();
      break;
    case !!types.length:
      activity = activityData[types[0]];
      break;
    case !!parentId:
      activity = config.children();
      break;
  }
  return activity;
};
