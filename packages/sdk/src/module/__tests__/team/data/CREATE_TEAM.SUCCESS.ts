export const xx = {
  host: 'glip',
  path: '/api/team',
  method: 'post',
  type: 'request-response',
  via: 'socket',
  request: {
    host: 'glip',
    path: '/api/team',
    method: 'post',
    headers: {
      Authorization:
        'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJ0b2tlbl9pZCI6MTU2MjAzNTc4NDk2MiwidHlwZSI6IndlYiIsInVpZCI6MTg3ODc1MzMxLCJpYXQiOjE1NjIwMzU3ODQsImlzcyI6ImdscGRldnhtbi5hc2lhbGFiLmdsaXAubmV0Iiwic3ViIjoiZ2xpcCJ9.ohqBT8dRFyvYgV3wi29BL0JrJXKLqlOGDJZnSKBH25x1zraYqu1JlkTmoiWF3O1fjMwT46SIrjNHzkPyDPiYZg',
    },
    data: {
      privacy: 'private',
      description: 'testing',
      members: [187875331],
      set_abbreviation: '[test] add member',
      is_team: true,
      permissions: {
        admin: {
          uids: [187875331],
        },
        user: {
          uids: [],
          level: 11,
        },
      },
      request_id: '4',
    },
    withCredentials: true,
  },
  response: {
    headers: {
      set_cookie: [],
      'Content-Type': 'application/json; charset=utf-8',
      'x-original-content-length': '550',
      'X-Request-Id': 'user_id:187875331;id:f764defa-8274-4b76-88a9-cb5b98cf36a0',
      'X-Frame-Options': 'DENY',
    },
    status: 201,
    data: {
      created_at: 1562220030489,
      creator_id: 187875331,
      version: 6805697933082624,
      model_size: 0,
      is_new: true,
      members: [187875331],
      is_team: true,
      is_public: false,
      privacy: 'private',
      description: 'testing',
      set_abbreviation: '[test] add member',
      permissions: {
        admin: {
          uids: [187875331],
        },
        user: {
          uids: [],
          level: 11,
        },
      },
      function_id: 'team',
      company_id: 401409,
      email_friendly_abbreviation: '_test__add_member',
      guest_user_company_ids: [],
      _id: 44425222,
      most_recent_content_modified_at: 1562220030489,
      modified_at: 1562220030489,
      deactivated: false,
    },
  },
};
