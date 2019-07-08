/*
 * @Author: Paynter Chen
 * @Date: 2019-07-05 10:57:02
 * Copyright © RingCentral. All rights reserved.
 */
import { IApi } from '../../../../types';
export interface IGlipTeamPost extends IApi {
  path: '/api/team/:id';
  method: 'post';
  query: {
    id: number;
  };
  request: {
    data: {
      privacy: string;
      description: string;
      members: number[];
      set_abbreviation: string;
      is_team: boolean;
      permissions: {
        admin: {
          uids: number[];
          level: number;
        };
        user: {
          uids: number[];
          level: number;
        };
      };
      request_id: string;
    };
  };
  response: {
    data: {
      created_at: number;
      creator_id: number;
      version: number;
      model_size: number;
      is_new: boolean;
      members: number[];
      is_team: boolean;
      is_public: boolean;
      privacy: string;
      description: string;
      set_abbreviation: string;
      permissions: {
        admin: {
          uids: number[];
          level: number;
        };
        user: {
          uids: number[];
          level: number;
        };
      };
      function_id: string;
      company_id: number;
      email_friendly_abbreviation: string;
      guest_user_company_ids: any[];
      _id: number;
      most_recent_content_modified_at: number;
      modified_at: number;
      deactivated: boolean;
    };
  };
}

// export type GlipTeam = {
//   // Get: IGet;
//   Post: IPost;
//   // Put: IPut;
// };

