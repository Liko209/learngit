export enum POST_TYPE {
  NOTIFICATION = 1,
  POST,
}

export const ActivityDataKeyMappingPostType = {
  set_abbreviation: POST_TYPE.NOTIFICATION,
  members: POST_TYPE.NOTIFICATION,
};

export const getPostType = (key: string) => {
  return ActivityDataKeyMappingPostType[key] || POST_TYPE.POST;
};
