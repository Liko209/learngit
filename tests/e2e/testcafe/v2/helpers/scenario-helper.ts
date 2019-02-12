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
      await this.createGroup(group);
    }
  }

  public async createGroup(group: IGroup): Promise<void> {
    assert(group.owner && group.members && group.type, "require owner, members and type");
    const platform = await this.sdkHelper.sdkManager.getPlatform(group.owner);
    const res = await platform.createGroup({
      type: group.type,
      name: group.name,
      members: group.members.map(user => user.rcId),
      privacy: group.privacy,
      isPublic: group.isPublic,
    });
    group.glipId = res.data.id;
  }
}

export { ScenarioHelper };
