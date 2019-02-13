import { SdkHelper } from './sdk-helper';
import { IGroup } from '../models';
import * as assert from 'assert';

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
    });
    team.glipId = res.data.id;
  }
}

export { ScenarioHelper };
