enum POST_TYPE {
  NOTIFICATION = 1,
  POST,
}

const ActivityDataKeyMappingPostType = {
  set_abbreviation: POST_TYPE.NOTIFICATION,
  members: POST_TYPE.NOTIFICATION,
};

const getPostType = (key: string) => {
  return ActivityDataKeyMappingPostType[key] || POST_TYPE.POST;
};

export { POST_TYPE, getPostType, ActivityDataKeyMappingPostType };
