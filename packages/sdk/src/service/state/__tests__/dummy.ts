export const sample = {
  _id: 3592486919,
  created_at: 1513170564815,
  creator_id: 3592527875,
  version: 5055123126484992,
  model_size: 0,
  is_new: true,
  person_id: 3592527875,
  current_group_id: 4325408770,
  current_plugin: 'events',
  tour_complete: true,
  modified_at: 1516809702791,
  deactivated: false,
  have_type_ids: [24, 14],
  do_kip_bot: true,
  first_time_users_ensured: true,
  _csrf: null,
  model_id: '3592486919',
  'unread_mentions_count:3780517890': 0,
  'marked_as_unread:3780517890': false,
  compose_cache: {
    3780517890: {
      selected: 'events',
    },
  },
  'read_through:3780517890': 758235140,
  current_person_id: 3592527875,
  last_group_id: 4325408770,
  'last_read_through:3780517890': 610017284,
  'unread_mentions_count:3788095490': 0,
  'read_through:3788095490': 758243332,
  'unread_mentions_count:3791036418': 0,
  'read_through:3791036418': 758251524,
  'unread_mentions_count:3793313794': 1,
  'read_through:3793313794': 758259716,
  'last_read_through:3793313794': 758259716,
  'marked_as_unread:3793313794': false,
  'last_read_through:3791036418': 758251524,
  'marked_as_unread:3791036418': true,
  'last_read_through:3788095490': 758243332,
  'marked_as_unread:3788095490': false,
  'unread_mentions_count:4325425154': 0,
  'marked_as_unread:4325425154': false,
  'unread_mentions_count:4325416962': 0,
  'marked_as_unread:4325416962': false,
  'unread_mentions_count:4325408770': 0,
  'marked_as_unread:4325408770': false,
  'unread_mentions_count:658546694': 0,
};

export const transformedMyState = {
  _csrf: null,
  away_status_history: [],
  compose_cache: { 3780517890: { selected: 'events' } },
  created_at: 1513170564815,
  creator_id: 3592527875,
  current_group_id: 4325408770,
  current_person_id: 3592527875,
  current_plugin: 'events',
  deactivated: false,
  do_kip_bot: true,
  first_time_users_ensured: true,
  have_type_ids: [24, 14],
  id: 3592486919,
  is_new: true,
  last_group_id: 4325408770,
  model_id: '3592486919',
  model_size: 0,
  modified_at: 1516809702791,
  person_id: 3592527875,
  tour_complete: true,
  version: 5055123126484992,
};

export const transformedGroupState = [
  {
    id: 3780517890,
    unread_mentions_count: 0,
    marked_as_unread: false,
    read_through: 758235140,
    last_read_through: 610017284,
  },
  {
    id: 3788095490,
    unread_mentions_count: 0,
    read_through: 758243332,
    last_read_through: 758243332,
    marked_as_unread: false,
  },
  {
    id: 3791036418,
    unread_mentions_count: 0,
    read_through: 758251524,
    last_read_through: 758251524,
    marked_as_unread: true,
  },
  {
    id: 3793313794,
    unread_mentions_count: 1,
    read_through: 758259716,
    last_read_through: 758259716,
    marked_as_unread: false,
  },
  {
    id: 4325425154,
    unread_mentions_count: 0,
    marked_as_unread: false,
  },
  {
    id: 4325416962,
    unread_mentions_count: 0,
    marked_as_unread: false,
  },
  {
    id: 4325408770,
    unread_mentions_count: 0,
    marked_as_unread: false,
  },
  { id: 658546694, unread_mentions_count: 0 },
];

export const sample2 = {
  _id: 3592486919,
  created_at: 1513170564815,
  creator_id: 3592527875,
  version: 5055123126484992,
  model_size: 0,
  is_new: true,
  person_id: 3592527875,
  current_group_id: 4325408770,
  current_plugin: 'events',
  tour_complete: true,
  modified_at: 1516809702791,
  deactivated: false,
  have_type_ids: [24, 14],
  do_kip_bot: true,
  first_time_users_ensured: true,
  _csrf: null,
};

export const partialSample = {
  _id: 1376263,
  version: 1475284066893824,
  person_id: 1376259,
  modified_at: 1535014387727,
  'post_cursor:3375110': 26,
};

export const originState = () => {
  return [
    {
      id: 532486,
      post_cursor: 2072,
      read_through: 533078020,
      last_read_through: 528793604,
      unread_mentions_count: 0,
      marked_as_unread: true,
      deactivated_post_cursor: 9,
      group_missed_calls_count: 0,
      group_tasks_count: 0,
      unread_deactivated_count: 0,
      previous_post_cursor: 1747,
      unread_count: 0,
      group_post_cursor: 2073,
    },
  ];
};

export const groupState1 = {
  id: 532486,
  read_through: 533078020,
  post_cursor: 2073,
};

export const groupStateResult1 = {
  group_post_cursor: 2073,
  id: 532486,
  post_cursor: 2073,
  read_through: 533078020,
  unread_count: 0,
  unread_deactivated_count: 0,
};

export const groupState2 = {
  id: 532486,
  group_post_cursor: 2074,
  __trigger_ids: [1409027],
};

export const groupStateResult2 = {
  group_post_cursor: 2074,
  id: 532486,
  post_cursor: 2072,
  unread_count: 2,
  unread_deactivated_count: 0,
};

export const groupState3 = {
  id: 532486,
  group_post_cursor: 2076,
  group_post_drp_cursor: 1,
  __trigger_ids: [1409027],
};

export const groupStateResultNoOrigin3 = {
  group_post_cursor: 2076,
  group_post_drp_cursor: 1,
  id: 532486,
  unread_count: 2077,
};

export const groupStateResult3 = {
  group_post_cursor: 2076,
  group_post_drp_cursor: 1,
  id: 532486,
  post_cursor: 2072,
  unread_count: 5,
  unread_deactivated_count: 0,
};

export const groupState4 = {
  id: 532487,
  group_post_cursor: 2071,
  __trigger_ids: [1409027],
};

export const groupState5 = {
  id: 532486,
  group_post_cursor: 2074,
  group_post_drp_cursor: 1,
  __trigger_ids: [1409027],
};

export const groupStateResult5 = {
  group_post_cursor: 2074,
  group_post_drp_cursor: 1,
  id: 532486,
  post_cursor: 2072,
  unread_count: 3,
  unread_deactivated_count: 0,
};

export const groupState6 = {
  id: 532486,
  group_post_drp_cursor: 1,
  __trigger_ids: [1409027],
};

export const groupStateResult6 = {
  group_post_cursor: 2073,
  group_post_drp_cursor: 1,
  id: 532486,
  post_cursor: 2072,
  unread_count: 2,
  unread_deactivated_count: 0,
};

export const groupState7 = {
  id: 532486,
  post_cursor: 2071,
  marked_as_unread: true,
};

export const groupStateResult7 = {
  group_post_cursor: 2073,
  id: 532486,
  marked_as_unread: true,
  post_cursor: 2071,
  unread_count: 2,
  unread_deactivated_count: 0,
};

export const groupState8 = {
  id: 532486,
  post_cursor: 2073,
  unread_deactivated_count: 1,
};

export const groupStateResult8 = {
  group_post_cursor: 2073,
  id: 532486,
  post_cursor: 2073,
  unread_count: 0,
  unread_deactivated_count: 1,
};

export const groupState9 = {
  id: 532486,
  post_cursor: 2071,
};

export const groupState10 = {
  id: 532486,
  group_post_cursor: 2070,
  group_post_drp_cursor: 1,
  __trigger_ids: [1409027],
};
