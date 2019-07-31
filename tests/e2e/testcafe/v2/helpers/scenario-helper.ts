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
    assert(team.type == 'Team', 'require type: Team');
    const platform = await this.sdkHelper.sdkManager.getPlatform(team.owner);
    const res = await platform.createTeam({
      name: team.name,
      members: team.members.map(user => { return { id: user.rcId, email: user.email }; }),
      public: team.isPublic,
      description: team.description,
    });
    // update model
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
    await platform.updateTeam(req, team.glipId);
    // update model
    _.assign(team, data);
  }

  public async leaveTeam(team: IGroup, me: IUser) {
    assert(team.glipId && me, "require glipId and me");
    const platform = await this.sdkHelper.sdkManager.getPlatform(me);
    await platform.leaveTeam(team.glipId);
    // update model
    _.pull(team.members, me);
  }

  public async deleteTeam(team: IGroup, operator: IUser) {
    const platform = await this.sdkHelper.sdkManager.getPlatform(operator);
    await platform.deleteTeam(team.glipId)
  }

  public async archiveTeam(team: IGroup, operator: IUser) {
    assert(team.glipId && operator, "require glipId and operator");
    const platform = await this.sdkHelper.sdkManager.getPlatform(operator);
    await platform.archiveTeam(team.glipId);
  }

  public async unArchiveTeam(team: IGroup, operator: IUser) {
    assert(team.glipId && operator, "require glipId and operator");
    const platform = await this.sdkHelper.sdkManager.getPlatform(operator);
    await platform.leaveTeam(team.glipId);
  }

  public async joinTeam(team: IGroup, me: IUser) {
    assert(team.glipId && me, "require glipId and me");
    const platform = await this.sdkHelper.sdkManager.getPlatform(me);
    await platform.joinTeam(team.glipId);
    // update model
    team.members.push(me);
  }

  public async removeMemberFromTeam(team: IGroup, data: IUser[], operator?: IUser) {
    assert(team.glipId, "require glipId");
    operator = operator || team.owner;
    assert(operator, "require operator or owner");
    const platform = await this.sdkHelper.sdkManager.getPlatform(operator);
    const req = data.map(user => { return { id: user.rcId, email: user.email }; })
    await platform.removeTeamMember(req, team.glipId);
    // update model
    _.pull(team.members, ...data);
  }

  public async addMemberToTeam(team: IGroup, data: IUser[], operator?: IUser) {
    assert(team.glipId, "require glipId");
    operator = operator || team.owner;
    assert(operator, "require operator or owner");
    const platform = await this.sdkHelper.sdkManager.getPlatform(operator);
    const req = data.map(user => { return { id: user.rcId, email: user.email }; })
    await platform.addTeamMember(req, team.glipId);
    // update model
    team.members.push(...data);
  }

  public async createOrOpenChat(chat: IGroup) {
    assert(chat.type == 'DirectMessage' || chat.type == 'Group', "require type: DirectMessage or Group");
    assert(chat.members && chat.owner, "require members and owner");
    const platform = await this.sdkHelper.sdkManager.getPlatform(chat.owner);
    const res = await platform.createOrOpenChat({
      members: chat.members.map(user => { return { id: user.rcId, email: user.email }; }),
    });
    // update model
    chat.glipId = res.data.id;
  }

  public async createTeamsOrChats(groups: IGroup[]) {
    for (const group of groups) {
      if (group.type == "Team") {
        await this.createTeam(group);
      } else {
        await this.createOrOpenChat(group);
      }
    }
  }

  public async sendTextPost(text: string, chat: IGroup, operator: IUser) {
    assert(text && chat && operator, "require text, chat and operator");
    const platform = await this.sdkHelper.sdkManager.getPlatform(operator);
    return await platform.sendTextPost(text, chat.glipId);
  }

  public async sentAndGetTextPostId(text: string, chat: IGroup, operator: IUser): Promise<string> {
    assert(text && chat && operator, "require text, chat and operator");
    const platform = await this.sdkHelper.sdkManager.getPlatform(operator);
    return await platform.sentAndGetTextPostId(text, chat.glipId);
  }

  public async addChatToFavorites(chat: IGroup, operator: IUser) {
    assert(chat && operator, "require chat and operator");
    const platform = await this.sdkHelper.sdkManager.getPlatform(operator);
    await platform.addChatToFavorites(chat.glipId);
  }

  async removeChatToFavorites(chat: IGroup, operator: IUser) {
    assert(chat && operator, "require chat and operator");
    const platform = await this.sdkHelper.sdkManager.getPlatform(operator);
    await platform.removeChatToFavorites(chat.glipId);
  }

  async uploadFile(data: { filePath: string, name?: string, group?: IGroup, operator: IUser }) {
    assert(data.operator && data.filePath, "require operator and filePath");
    const platform = await this.sdkHelper.sdkManager.getPlatform(data.operator);
    return await platform.uploadFile(data.filePath, data.name, data.group ? data.group.glipId : undefined);
  }

  async createPostWithTextAndFilesThenGetPostId(data: { filePaths: string | string[], group: IGroup, text?: string, operator: IUser, fileNames?: string | string[] }): Promise<string> {
    assert(data.operator && data.filePaths && data.group, "require operator and filePaths");
    const platform = await this.sdkHelper.sdkManager.getPlatform(data.operator);
    return await platform.createPostWithTextAndFilesThenGetPostId(data.group.glipId, data.filePaths, data.text, data.fileNames);
  }

  async createPostWithTextAndFiles(data: { filePaths: string | string[], group: IGroup, text?: string, operator: IUser, fileNames?: string | string[] }): Promise<any> {
    assert(data.operator && data.filePaths && data.group, "require operator and filePaths");
    const platform = await this.sdkHelper.sdkManager.getPlatform(data.operator);
    return await platform.createPostWithTextAndFiles(data.group.glipId, data.filePaths, data.text, data.fileNames);
  }

  // glip
  public async clearAllUmi(me: IUser) {
    assert(me, "require me");
    const glip = await this.sdkHelper.sdkManager.getGlip(me);
    await glip.clearAllUmi(me.rcId);
  }

  public async resetProfileAndState(me: IUser) {
    assert(me, "require me");
    const glip = await this.sdkHelper.sdkManager.getGlip(me);
    await glip.resetProfileAndState(me.rcId);
  }

  public async resetProfile(me: IUser) {
    assert(me, "require me");
    const glip = await this.sdkHelper.sdkManager.getGlip(me);
    await glip.resetProfile(me.rcId);
  }

  public async resetState(me: IUser) {
    assert(me, "require me");
    const glip = await this.sdkHelper.sdkManager.getGlip(me);
    await glip.resetState(me.rcId);
  }

  public async likePost(postId: string, me: IUser) {
    assert(postId && me, "require postId and me");
    const glip = await this.sdkHelper.sdkManager.getGlip(me);
    await glip.likePost(postId);
  }

  public async unlikePost(postId: string, me: IUser) {
    assert(postId && me, "require postId and me");
    const glip = await this.sdkHelper.sdkManager.getGlip(me);
    await glip.unlikePost(postId);
  }
}


export { ScenarioHelper };
