import { BaseWebComponent } from "../../BaseWebComponent";
import { IGroup } from '../../../models';


export class SearchDialog extends BaseWebComponent {
  get self() {
    return this.getSelector('[role="document"]');
  }

  get searchIcon() {
    return this.getSelectorByIcon('search', this.self);
  }

  get inputArea() {
    return this.getSelectorByAutomationId('global-search-input')
  }

  async clickInputArea() {
    await this.t.click(this.inputArea);
  }

  async clearInputAreaTextByKey() {
    await this.t.click(this.inputArea).selectText(this.inputArea).pressKey('delete');
  }

  async typeSearchKeyword(text: string, options: TypeActionOptions = { speed: 0.5 }) {
    await this.t.typeText(this.inputArea, text, options);
  }

  get clearButton() {
    return this.getSelectorByAutomationId('global-search-clear');
  }

  get clickClearButton() {
    return this.t.click(this.clearButton);
  }

  get closeButton() {
    return this.getSelectorByIcon('close');
  }

  async clickCloseButton() {
    await this.t.click(this.closeButton);
  }

  get allResultItems() {
    return this.getSelector('.search-items'); //this includes content search items
  }

  get itemsNames() {
    return this.getSelectorByAutomationId('search-item-text')
  }

  get peoples() {
    return this.getSelectorByAutomationId('search-people-item');
  }

  get groups() {
    return this.getSelectorByAutomationId('search-groups-item');
  }

  get teams() {
    return this.getSelectorByAutomationId('search-teams-item');
  }

  nthPeople(n: number) {
    return this.getComponent(SearchItem, this.peoples.nth(n));
  }

  nthGroup(n: number) {
    return this.getComponent(SearchItem, this.groups.nth(n));
  }

  nthTeam(n: number) {
    return this.getComponent(SearchItem, this.teams.nth(n));
  }

  nthResultOfAll(n: number) {
    return this.getComponent(SearchItem, this.allResultItems.nth(n));
  }

  getSearchItemByCid(cid: string) {
    this.warnFlakySelector();
    const root = this.allResultItems.child().find(`[cid="${cid}"]`).parent('.search-items');
    return this.getComponent(SearchItem, root);
  }

  getSearchItemByName(name: string) {
    return this.getComponent(SearchItem, this.itemsNames.withText(name).parent('.search-items'));
  }

  async dropDownListShouldContainTeam(team: IGroup, timeout: number = 20e3) {
    await this.t.expect(this.teams.withText(team.name).exists).ok({ timeout });
  }

  /*  instant search */
  get instantContainer() {
    return this.getSelectorByAutomationId('search-results');
  }

  get peopleHeader() {
    return this.getSelectorByAutomationId('search-people');
  }

  get groupsHeader() {
    return this.getSelectorByAutomationId('search-groups');
  }

  get teamsHeader() {
    return this.getSelectorByAutomationId('search-teams');
  }

  get showMorePeopleButton() {
    return this.getSelectorByAutomationId('search-people-button');
  }

  get showMoreGroupsButton() {
    return this.getSelectorByAutomationId('search-groups-button');
  }

  get showMoreTeamsButton() {
    return this.getSelectorByAutomationId('search-teams-button');
  }

  async clickShowMorePeople() {
    await this.t.click(this.showMorePeopleButton);
  }

  async clickShowMoreGroups() {
    await this.t.click(this.showMoreGroupsButton);
  }

  async clickShowMoreTeams() {
    await this.t.click(this.showMoreTeamsButton);
  }

  /* content search */
  get contentSearchHeader() {
    return this.getSelectorByAutomationId('search-content');
  }

  get contentSearchItem() {
    return this.getSelectorByAutomationId('search-content-item');
  }

  get contentSearchGlobalEntry() {
    return this.contentSearchItem.nth(0);
  }

  get contentSearchInThisConversationEntry() {
    return this.contentSearchItem.nth(1);
  }

  async clickContentSearchGlobalEntry() {
    await this.t.click(this.contentSearchGlobalEntry);
  }

  async clickContentSearchInThisConversationEntry() {
    await this.t.click(this.contentSearchInThisConversationEntry);
  }

  get showMoreContentButton() {
    return this.getSelectorByAutomationId('search-content-button');
  }

  async clickShowMoreContentButton() {
    await this.t.click(this.showMoreContentButton);
  }

  /* recently searches */
  get historyContainer() {
    return this.getSelectorByAutomationId('search-records');
  };

  get historyHeader() {
    return this.getSelectorByAutomationId('search-clear');
  }

  get clearHistoryButton() {
    return this.historyHeader.find('span');
  }

  async clickClearHistory() {
    await this.t.click(this.clearHistoryButton)
  }

  /* tabs */
  get messagesTabEntry() {
    return this.getSelectorByAutomationId('globalSearch-messages');
  }

  get peopleTabEntry() {
    return this.getSelectorByAutomationId('globalSearch-people');
  }

  get groupsTabEntry() {
    return this.getSelectorByAutomationId('globalSearch-groups');
  }

  get teamsTabEntry() {
    return this.getSelectorByAutomationId('globalSearch-team');
  }

  /* page assert */
  async shouldShowInstantList() {
    await this.t.expect(this.instantContainer.exists).ok();
  }

  async shouldShowRecentlyHistory() {
    await this.t.expect(this.historyContainer.exists).ok();
  }

}

class SearchItem extends BaseWebComponent {
  get avatar() {
    return this.getSelectorByAutomationId('search-item-avatar', this.self);
  }

  get name() {
    return this.getSelectorByAutomationId('search-item-text', this.self);
  }

  // people
  get uid() {
    return this.avatar.find("div").withAttribute('uid').getAttribute('uid');
  }

  get telephonyButton() {
    return this.telephonyIcon.parent('button');
  }

  get telephonyIcon() {
    return this.getSelectorByIcon('phone', this.self);
  }

  async clickTelephonyButton() {
    await this.t.hover(this.self).click(this.telephonyButton);
  }

  async makeCall() {
    await this.t.hover(this.self).click(this.telephonyButton);
  }

  // group or team
  get cid() {
    return this.avatar.find("div").withAttribute('cid').getAttribute('cid');
  }

  async getName() {
    return await this.name.textContent;
  }

  async getId() {
    if (await this.avatar.find('div').withAttribute('uid').exists) {
      return await this.uid;
    }
    return await this.cid;
  }

  async enter() {
    await this.t.click(this.self);
  }

  get privateLabel() {
    return this.getSelectorByAutomationId('search-item-private', this.self);
  }

  async shouldHavePrivateLabel() {
    await this.t.expect(this.privateLabel.visible).ok();
  }

  async shouldNotHavePrivateLabel() {
    await this.t.expect(this.privateLabel.visible).notOk();
  }

  get joinedLabel() {
    return this.getSelectorByAutomationId('search-item-joined', this.self);
  }

  async shouldHaveJoinedLabel() {
    await this.t.expect(this.joinedLabel.visible).ok();
  }

  async shouldNotHaveJoinedLabel() {
    await this.t.expect(this.joinedLabel.visible).notOk();
  }

  get joinButton() {
    return this.getSelectorByAutomationId('joinButton', this.self);
  }

  async shouldHaveJoinButton() {
    await this.t.expect(this.joinButton.visible).ok();
  }

  async shouldNotHaveJoinButton() {
    await this.t.expect(this.joinButton.exists).notOk();
  }

  async join() {
    await this.t.hover(this.self).click(this.joinButton);
  }

  async clickAvatar() {
    await this.t.click(this.avatar);
  }

  async clickName() {
    await this.t.click(this.name);
  }

  get messageButton() {
    return this.getSelectorByAutomationId('goToConversationIcon', this.self);
  }

  get messageIcon() {
    return this.getSelectorByIcon('messages', this.messageButton);
  }

  async clickMessageButton() {
    await this.t.hover(this.self).click(this.messageButton);
  }
}


export class JoinTeamDialog extends BaseWebComponent {
  get self() {
    this.warnFlakySelector();
    return this.getSelector('*[role="dialog"]');
  }

  get title() {
    return this.getSelector('h2', this.self).withText('Join team?')
  }

  get exists() {
    return this.title.exists;
  }

  get content() {
    return this.self.find('p').withText("You are not currently a member of the");
  }

  async shouldBeTeam(teamName: string) {
    const reg = new RegExp(`You are not currently a member of the ${teamName} team. Would you like to join the team?`)
    await this.t.expect(this.content.textContent).match(reg, { timeout: 10e3 });
  }

  get joinButton() {
    return this.self.find('button').withText('Join');
  }

  get cancelButton() {
    return this.self.find('button').withText('Cancel');
  }

  async join() {
    await this.t.click(this.joinButton);
  }

  async cancel() {
    await this.t.click(this.cancelButton);
  }
}
