import { SdkHelper } from './sdk-helper';
import { IGroup, IUser } from '../models';
import * as assert from 'assert';
import * as _ from 'lodash';

import { getLogger } from 'log4js';
const logger = getLogger(__filename);
logger.level = 'info';

class ScenarioHelper {

  constructor(
    private t: TestController,
    private sdkHelper: SdkHelper,
  ) { }

  public async createTeams(teams: IGroup[]): Promise<void> {
    for (const team of teams) {
      await this.createTeam(team);
    }
  }

  public async createTeam(team: IGroup): Promise<void> {
    assert(team.owner && team.members, "require owner, members");
    const platform = await this.sdkHelper.sdkManager.getPlatform(team.owner);
    const res = await platform.createTeam({
      name: team.name,
      members: team.members.map(user => { return { id: user.rcId }; }),
      public: team.isPublic,
      description: team.description,
    });
    team.glipId = res.data.id;
  }

  public async updateTeam(team: IGroup, data: Partial<IGroup>, operator?: IUser) {
    assert(team.glipId, "require glipId");
    operator = operator || team.owner;
    assert(operator, "require operator or owner");
    const platform = await this.sdkHelper.sdkManager.getPlatform(operator);
    const req = _.omitBy({
      name: data.name,
      public: data.isPublic,
      description: data.description,
    }, _.isNil);
    logger.info("request data of update Team", req);
    const res = await platform.updateTeam(req, team.glipId);
    _.assign(team, data);
  }
}

export { ScenarioHelper };
