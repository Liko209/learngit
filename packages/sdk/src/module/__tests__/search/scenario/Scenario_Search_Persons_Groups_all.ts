/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-08-27 18:01:41
 * Copyright © RingCentral. All rights reserved.
 */

export class Scenario_Search_Persons_Groups_all {
  static expectResult = {
    terms: ['th'],
    sortableModels: [
      {
        lowerCaseName: 'thomas simonis',
        id: 370909186,
        displayName: 'Thomas Simonis',
        sortWeights: [1.1, 0],
        entity: {
          created_at: 1560144916423,
          creator_id: 187875331,
          version: 8053173581250560,
          model_size: 0,
          is_new: true,
          members: [187875331, 190316547],
          function_id: 'group',
          company_id: 401409,
          guest_user_company_ids: [],
          set_abbreviation: 'user239+user540',
          email_friendly_abbreviation: 'user239+user540',
          privacy: 'private',
          is_team: false,
          most_recent_content_modified_at: 1560144916423,
          modified_at: 1560144916423,
          deactivated: false,
          id: 370909186,
          is_public: false,
        },
      },
      {
        lowerCaseName: 'thomas yang',
        id: 367419394,
        displayName: 'Thomas Yang',
        sortWeights: [1.1, 0],
        entity: {
          created_at: 1559180804363,
          creator_id: 187809795,
          version: 6248966496714752,
          model_size: 0,
          is_new: false,
          members: [187809795, 187875331],
          company_id: 401409,
          guest_user_company_ids: [],
          set_abbreviation: 'user231+user239',
          email_friendly_abbreviation: 'user231+user239',
          privacy: 'private',
          is_team: false,
          most_recent_content_modified_at: 1560857774587,
          modified_at: 1560823595351,
          deactivated: false,
          most_recent_post_id: 2756591620,
          most_recent_post_created_at: 1560823592236,
          pinned_post_ids: [],
          model_id: '367419394',
          id: 367419394,
          is_public: false,
        },
      },
      {
        lowerCaseName: 'fiji-6666 this is a public team, not include me',
        id: 43212807,
        displayName: 'FIJI-6666 This is a public team, not include me',
        sortWeights: [1, 0],
        entity: {
          created_at: 1559526641756,
          creator_id: 187809795,
          version: 2570768384786432,
          model_size: 0,
          is_new: true,
          members: [187809795],
          is_team: true,
          is_public: true,
          privacy: 'protected',
          description: '',
          set_abbreviation: 'FIJI-6666 This is a public team, not include me',
          permissions: {
            admin: { uids: [187809795] },
            user: { uids: [], level: 11 },
          },
          function_id: 'team',
          company_id: 401409,
          email_friendly_abbreviation: 'linkdemo',
          guest_user_company_ids: [],
          most_recent_content_modified_at: 1560930105979,
          modified_at: 1560930101111,
          deactivated: false,
          most_recent_post_id: 2766872580,
          most_recent_post_created_at: 1560930100930,
          id: 43212807,
        },
      },
    ],
  };

  static input = {
    searchKey: 'th',
    personOption: {
      fetchAllIfSearchKeyEmpty: false,
      meFirst: false,
    },
    groupOption: {
      fetchAllIfSearchKeyEmpty: false,
      meFirst: false,
    },
  };
}
