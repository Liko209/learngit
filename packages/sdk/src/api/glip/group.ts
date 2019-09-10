/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-09 13:41:15
 * Copyright © RingCentral. All rights reserved.
 */
import Api from '../api';
import { GroupApiType } from '../../models';
import { Group } from '../../module/group/entity';
import { Raw } from '../../framework/model';
import { NETWORK_VIA } from 'foundation/network';

class GroupAPI extends Api {
  /**
   *
   * @param {*} id  group id
   * return group or null
   */
  static basePath = '/group';
  static requestGroupById(id: number) {
    return GroupAPI.getDataById<Group>(id);
  }

  static requestNewGroup(options: Partial<Group>) {
    return GroupAPI.postData<Group>(options);
  }

  static pinPost(path: string, options: object) {
    return GroupAPI.glipNetworkClient.put<Raw<Group>>({ path, data: options });
  }

  static addTeamMembers(groupId: number, memberIds: number[]) {
    return GroupAPI.glipNetworkClient.put<Raw<Group>>({
      path: `/add_team_members/${groupId}`,
      data: {
        members: memberIds,
      },
    });
  }

  static createTeam(data: Partial<GroupApiType>) {
    return GroupAPI.glipNetworkClient.post<Raw<Group>>({ data, path: '/team' });
  }

  static convertToTeam(data: Partial<GroupApiType>) {
    return GroupAPI.glipNetworkClient.post<Raw<Group>>({
      data,
      path: '/convert_to_team',
    });
  }

  static putTeamById(id: number, group: Partial<GroupApiType>) {
    group._id = group.id;
    delete group.id;
    const path = group.is_team ? `/team/${id}` : `/group/${id}`;
    return GroupAPI.glipNetworkClient.put<Raw<Group>>({ path, data: group });
  }

  static sendTypingEvent(options: any) {
    return GroupAPI.glipNetworkClient.send({
      path: '',
      data: options,
      via: NETWORK_VIA.SOCKET,
      channel: 'typing',
    });
  }
}

export default GroupAPI;
