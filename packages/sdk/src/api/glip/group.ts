/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-09 13:41:15
 * Copyright © RingCentral. All rights reserved.
 */
import Api from '../api';
import { GroupApiType } from '../../models';
import { Group } from '../../module/group/entity';
import { Raw } from '../../framework/model';

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

  static convertToTeam(data: Partial<GroupApiType>) {
    return this.glipNetworkClient.post<Raw<Group>>('/convert_to_team', data);
  }

  static putTeamById(id: number, group: Partial<GroupApiType>) {
    group._id = group.id;
    delete group.id;
    const path = group.is_team ? `/team/${id}` : `/group/${id}`;
    return this.glipNetworkClient.put<Raw<Group>>(path, group);
  }
}

export default GroupAPI;
