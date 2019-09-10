/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-08-27 18:01:41
 * Copyright © RingCentral. All rights reserved.
 */

export class Scenario_SearchAllGroup_myGroupOnly {
  static expectResult = {
    terms: ['fiji'],
    sortableModels: [
      {
        lowerCaseName: 'fiji-6005',
        id: 43655174,
        displayName: 'FIJI-6005',
        sortWeights: [1.1, 0],
        entity: {
          created_at: 1560136531601,
          creator_id: 187875331,
          version: 2776186767802368,
          model_size: 0,
          is_new: false,
          members: [187875331, 187973635, 191356931, 193953795],
          is_team: true,
          is_public: true,
          privacy: 'protected',
          description: '',
          set_abbreviation: 'FIJI-6005',
          permissions: {
            admin: { uids: [187875331] },
            user: { uids: [], level: 11 },
          },
          function_id: 'team',
          company_id: 401409,
          email_friendly_abbreviation: 'fiji-6005',
          guest_user_company_ids: [],
          most_recent_content_modified_at: 1560220075914,
          modified_at: 1560220075976,
          deactivated: false,
          model_id: '43655174',
          most_recent_post_id: 2732572676,
          most_recent_post_created_at: 1560220075914,
          id: 43655174,
        },
      },
      {
        lowerCaseName: 'fiji-6098',
        id: 43687942,
        displayName: 'FIJI-6098',
        sortWeights: [1.1, 0],
        entity: {
          created_at: 1560222299834,
          creator_id: 187875331,
          version: 1133375922372608,
          model_size: 0,
          is_new: true,
          members: [187654147, 187875331, 187908099],
          is_team: true,
          is_public: true,
          privacy: 'protected',
          description: '',
          set_abbreviation: 'FIJI-6098',
          permissions: {
            admin: { uids: [187875331] },
            user: { uids: [], level: 11 },
          },
          function_id: 'team',
          company_id: 401409,
          email_friendly_abbreviation: 'fiji-6098',
          guest_user_company_ids: [],
          most_recent_content_modified_at: 1560222350473,
          modified_at: 1560222350517,
          deactivated: false,
          most_recent_post_id: 2732769284,
          most_recent_post_created_at: 1560222350473,
          id: 43687942,
        },
      },
      {
        lowerCaseName:
          'fiji-6451 release tag is incorrect when uploading crash log before start app',
        id: 43696134,
        displayName:
          'FIJI-6451 Release tag is incorrect when uploading crash log before start app',
        sortWeights: [1.1, 0],
        entity: {
          created_at: 1560235444146,
          creator_id: 187875331,
          version: 7122907205468160,
          model_size: 0,
          is_new: true,
          members: [187875331, 187572227, 191791107],
          is_team: true,
          is_public: true,
          privacy: 'protected',
          description: '',
          set_abbreviation:
            'FIJI-6451 Release tag is incorrect when uploading crash log before start app',
          permissions: {
            admin: { uids: [187875331] },
            user: { uids: [], level: 11 },
          },
          function_id: 'team',
          company_id: 401409,
          email_friendly_abbreviation:
            'fiji-6451_release_tag_is_incorrect_when_uploading_crash_log_before_start_app',
          guest_user_company_ids: [],
          most_recent_content_modified_at: 1560393241631,
          modified_at: 1560393241659,
          deactivated: false,
          most_recent_post_id: 2742378500,
          most_recent_post_created_at: 1560393241615,
          id: 43696134,
        },
      },
    ],
  };

  static input = {
    searchKey: 'fiji',
    option: {
      fetchAllIfSearchKeyEmpty: false,
      myGroupsOnly: true,
    },
  };
}
