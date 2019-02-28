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
    return this.getSelectorByAutomationId('search-input');
  }

  async clickInputArea() {
    await this.t.click(this.inputArea);
  }

  async typeSearchKeyword(text: string, options?: TypeActionOptions) {
    await this.t.typeText(this.inputArea, text, options)
  }

  get closeButton() {
    return this.getSelectorByIcon('close');
  }

  async close() {
    await this.t.click(this.closeButton);
  }

  get allResultItems() {
    return this.getSelector('.search-items');
  }

  get historyItems() {
    return this.getSelectorByAutomationId(''); // FIXME 
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

  nthHistory(n: number) {
    return this.getComponent(SearchItem, this.historyItems.nth(n));
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

  get historyHeader() {
    return this.getSelectorByAutomationId('search-History');  // FIXME
  }
  
  showMoreButtonOn(header: Selector) {
    return header.find('span').withText('Show more')
  }

  get showMorePeopleButton() {
    return this.showMoreButtonOn(this.peopleHeader);
  }

  get showMoreGroupsButton() {
    return this.showMoreButtonOn(this.groupsHeader);
  }

  get showMoreTeamsButton() {
    return this.showMoreButtonOn(this.teamsHeader);
  }

  get clearHistoryButton() {
    return this.historyHeader.find('span').withText('Clear History'); //FIXME
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

  // group or team
  get cid() {
    return this.avatar.find("div").withAttribute('cid').getAttribute('cid');
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