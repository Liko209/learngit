/*
 * @Author: Paynter Chen
 * @Date: 2019-01-02 09:30:31
 * Copyright © RingCentral. All rights reserved.
 */

import { Group } from '../entity';
import pick from 'lodash/pick';
import { IPartialModifyController } from '../../../framework/controller/interface/IPartialModifyController';
import { IRequestController } from '../../../framework/controller/interface/IRequestController';

class TeamActionController {
  constructor(
    public partialModifyController: IPartialModifyController<Group>,
    public requestController: IRequestController<Group>,
  ) { }

  isInTeam(userId: number, team: Group) {
    return team
      && team.is_team
      && team.members
      && team.members.includes(userId);
  }

  canJoinTeam(team: Group) {
    return team.privacy === 'protected';
  }

  async joinTeam(userId: number, teamId: number) {
    return this.partialModifyController.updatePartially(
      teamId,
      (partialEntity, originalEntity) => {
        if (this.isInTeam(userId, originalEntity)) {
          throw 'already in team!';
        }
        if (!this.canJoinTeam(originalEntity)) {
          throw 'can not join team';
        }
        return {
          ...partialEntity,
          members: originalEntity.members.concat([userId]),
        };
      },
      async (newEntity: Group) => {
        return this.requestController.put(pick(newEntity, ['id', '_id', 'members']));
      },
    );
  }
}

export { TeamActionController };
