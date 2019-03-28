import { BaseWebComponent } from "../../BaseWebComponent";
import { IGroup } from '../../../models';

export class Header extends BaseWebComponent {
  get self() {
    return this.getSelector('header');
  }

  getBackNForward(name: string) {
    return this.getComponent(
      BackNForward,
      this.getSelectorByAutomationId(name, this.self)
    );
  }

  get backButton() {
    return this.getBackNForward('Back');
  }

  get forwardButton() {
    return this.getBackNForward('Forward');
  }

  get search() {
    this.warnFlakySelector();
    return this.getComponent(Search, this.getSelector('.search-bar', this.self));
  }
}

class BackNForward extends BaseWebComponent {
  async click() {
    await this.t.click(this.self);
  }

  get isDisable(): Promise<boolean> {
    return this.self.hasAttribute('disabled');
  }

  async shouldBeDisabled() {
    await this.t.expect(this.isDisable).ok();
  }

  async shouldBeEnabled() {
    await this.t.expect(this.isDisable).notOk();
  }
}

class Search extends BaseWebComponent {
  get icon() {
    return this.getSelectorByAutomationId('search-icon');
  }

  get inputArea() {
    return this.getSelectorByAutomationId('search-input').find('input');
  }

  async clickInputArea() {
    await this.t.click(this.inputArea);
  }

  async clearInputAreaText() {
    await this.t.click(this.inputArea).selectText(this.inputArea).pressKey('delete');
  }

  async typeSearchKeyword(text: string, options?: TypeActionOptions) {
    await this.t.typeText(this.inputArea, text, options)
  }

  get closeButton() {
    return this.getSelectorByIcon('close');
  }

  async clickCloseButton() {
    await this.t.click(this.closeButton);
  }

  get allResultItems() {
    return this.getSelector('.search-items');
  }

  get itemsNames() {
    return this.getSelectorByAutomationId('search-item-text')
  }

  get peoples() {
    return this.getSelectorByAutomationId('search-People-item');
  }

  get groups() {
    return this.getSelectorByAutomationId('search-Groups-item');
  }

  get teams() {
    return this.getSelectorByAutomationId('search-Teams-item');
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

  nthAllResults(n: number) {
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

  get peopleHeader() {
    return this.getSelectorByAutomationId('search-People');
  }

  get groupsHeader() {
    return this.getSelectorByAutomationId('search-Groups');
  }

  get teamsHeader() {
    return this.getSelectorByAutomationId('search-Teams');
  }

  get historyContainer() {
    return this.getSelectorByAutomationId('search-records');
  };

  get searchResultsContainer() {
    return this.getSelectorByAutomationId('search-results');
  }

  async shouldShowRecentlyHistory() {
    await this.t.expect(this.historyContainer.exists).ok();
  }

  async shouldShowSearchResults() {
    await this.t.expect(this.searchResultsContainer.exists).ok();
  }

  get historyHeader() {
    return this.getSelectorByAutomationId('search-clear');
  }

  get showMorePeopleButton() {
    return this.peopleHeader.find('span');
  }

  get showMoreGroupsButton() {
    return this.groupsHeader.find('span');
  }

  get showMoreTeamsButton() {
    return this.teamsHeader.find('span');
  }

  get clearHistoryButton() {
    return this.historyHeader.find('span');
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

  async clickClearHistory() {
    await this.t.click(this.clearHistoryButton)
  }


  async quit() {
    await this.t.pressKey('esc');
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


export class joinTeamDialog extends BaseWebComponent {
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
