/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-09 13:41:15
 * Copyright © RingCentral. All rights reserved.
 */
import Api from '../api';
import { Group, GroupApiType, Raw } from '../../models';

class GroupAPI extends Api {
  /**
   *
   * @param {*} id  group id
   * return group or null
   */
  static basePath = '/group';
  static requestGroupById(id: number) {
    return this.getDataById<Group>(id);
  }

  static requestNewGroup(options: Partial<Group>) {
    return this.postData<Group>(options);
  }

  static pinPost(path: string, options: object) {
    return this.glipNetworkClient.put<Raw<Group>>(path, options);
  }

  static addTeamMembers(groupId: number, memberIds: number[]) {
    return this.glipNetworkClient.put<Raw<Group>>(
      `/add_team_members/${groupId}`,
      {
        members: memberIds,
      },
    );
  }

  static createTeam(data: Partial<GroupApiType>) {
    return this.glipNetworkClient.post<Raw<Group>>('/team', data);
  }
}

export default GroupAPI;
