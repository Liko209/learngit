import { SdkHelper } from './sdk-helper';
import { IGroup } from '../models';
import * as assert from 'assert';

class ScenarioHelper {

  constructor(
    private t: TestController,
    private sdkHelper: SdkHelper,
  ) { }

  public async createGroups(groups: IGroup[]): Promise<void> {
    for (const group of groups) {
      assert(group.owner && group.members && group.type, "require owner, members and type");
      const platform = await this.sdkHelper.sdkManager.getPlatform(group.owner);
      const res = await platform.createGroup({
        type: group.type,
        name: group.name,
        members: group.members.map(user => user.rcId),
      });
      group.glipId = res.data.id;
    }
  }
}

export { ScenarioHelper };
