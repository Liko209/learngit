/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-09 13:41:15
 * Copyright © RingCentral. All rights reserved.
 */
import { IResponse } from '../NetworkClient';
import Api from '../api';
import { Group, GroupApiType, Raw } from '../../models';

class GroupAPI extends Api {
  /**
   *
   * @param {*} id  group id
   * return group or null
   */
  static basePath = '/group';
  static requestGroupById(id: number): Promise<IResponse<Raw<Group>>> {
    return this.getDataById(id);
  }

  static requestNewGroup(
    options: Partial<Group>,
  ): Promise<IResponse<Raw<Group>>> {
    return this.postData(options);
  }

  static pinPost(
    path: string,
    options: object,
  ): Promise<IResponse<Raw<Group>>> {
    return this.glipNetworkClient.put(path, options);
  }

  static addTeamMembers(
    groupId: number,
    memberIds: number[],
  ): Promise<IResponse<Raw<Group>>> {
    return this.glipNetworkClient.put(`/add_team_members/${groupId}`, {
      members: memberIds,
    });
  }

  static createTeam(
    data: Partial<GroupApiType>,
  ): Promise<IResponse<Raw<Group>>> {
    return this.glipNetworkClient.post('/team', data);
  }
}

export default GroupAPI;
