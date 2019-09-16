import { BaseWebComponent } from "../../BaseWebComponent";
import * as assert from 'assert';
import * as _ from 'lodash';
import { BaseConversationPage } from "./MessageTab/ConversationPage";
import { H } from "../../../helpers";
import { SearchComoBox } from "./SearchComboBox";


export class SearchDialog extends BaseWebComponent {
  get self() {
    this.warnFlakySelector();
    return this.getSelector('[role="dialog"]');
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

  async typeSearchKeyword(text: string, options: TypeActionOptions = { replace: true, paste: true }) {
    await this.t.typeText(this.inputArea, text, options);
  }

  get clearButton() {
    return this.getSelectorByAutomationId('search-input-clear');
  }

  async clickClearButton() {
    await this.t.click(this.clearButton);
  }

  get closeButton() {
    return this.getSelectorByIcon('close');
  }

  async clickCloseButton() {
    await this.t.click(this.closeButton);
  }

  get instantPage() {
    return this.getComponent(InstantSearch);
  }

  get recentPage() {
    return this.getComponent(RecentSearch);
  }

  get fullSearchPage() {
    return this.getComponent(FullSearch);
  }
}

class BaseSearchResultPage extends BaseWebComponent {
  get self() {
    return this.getSelector('[role="document"]');
  }

  get items() {
    return this.getSelector('.search-items'); //this includes content search items
  }

  get itemsNames() {
    return this.getSelectorByAutomationId('search-item-text')
  }

  nthItemOfAll(n: number) {
    return this.getComponent(SearchItem, this.items.nth(n));
  }

  conversationEntryByCid(cid: string) {
    this.warnFlakySelector();
    const root = this.items.child().find(`[cid="${cid}"]`).parent('.search-items');
    return this.getComponent(SearchItem, root);
  }

  conversationEntryByName(name: string) {
    return this.getComponent(SearchItem, this.itemsNames.withText(name).parent('.search-items'));
  }

  async conversationsContainName(name: string, timeout: number = 20e3) {
    await this.t.expect(this.itemsNames.withExactText(name).exists).ok({ timeout });
  }
}

class InstantSearch extends BaseSearchResultPage {
  get self() {
    return this.getSelectorByAutomationId('search-results');
  }

  get items() {
    return this.getSelector('.search-items'); //this includes content search items
  }

  get conversationItems() {
    return this.getSelector('.search-items:not([data-test-automation-id="search-content-item"])');
  }

  nthConversation(n: number) {
    return this.getComponent(SearchItem, this.conversationItems.nth(n));
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

  async conversationsContainName(name: string, timeout: number = 20e3) {
    await this.t.expect(this.conversationItems.withText(name).exists).ok({ timeout });
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

  searchPeopleWithText(text: string) {
    return this.getComponent(SearchItem, this.peoples.withText(text));
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

}

class RecentSearch extends BaseSearchResultPage {
  get self() {
    return this.getSelectorByAutomationId('search-records');
  }

  get historyHeader() {
    return this.getSelectorByAutomationId('search-clear');
  }

  get clearHistoryButton() {
    return this.getSelectorByAutomationId('search-clear-button');
  }

  async clickClearHistory() {
    await this.t.click(this.clearHistoryButton)
  }

  get contentItems() {
    return this.getSelectorByAutomationId('search-message-item');
  }

  get contentInGlobalItems() {
    return this.contentItems.withAttribute('data-id', '');
  }

  get contentInConversationItems() {
    return this.contentItems.filter(el => { return '' != el.getAttribute('data-id') }
    );
  }

  contentInConversationByCId(cid: string) {
    return this.getComponent(SearchItem, this.contentInConversationItems.filter(`[data-id="${cid}"]`));
  }

  itemByName(name: string) {
    return this.getComponent(SearchItem, this.itemsNames.withExactText(name).parent('li'));
  }

  contentItemByName(name: string) {
    return this.getComponent(SearchItem, this.contentItems.find('[data-test-automation-id="search-item-text"]').withExactText(name).parent('li'));
  }

  contentInGlobalBYName(name: string) {
    return this.getComponent(SearchItem, this.contentInGlobalItems.find('[data-test-automation-id="search-item-text"]').withExactText(name).parent('li'));
  }

  contentInConversationByName(name: string) {
    return this.getComponent(SearchItem, this.contentInConversationItems.find('[data-test-automation-id="search-item-text"]').withExactText(name).parent('li'));
  }

  get conversationItems() {
    return this.getSelector('.search-items:not([data-test-automation-id="search-message-item"])');
  }

  conversationByName(name: string) {
    return this.getComponent(SearchItem, this.itemsNames.withText(name).parent('.search-items:not([data-test-automation-id="search-message-item"])'));
  }
}

class FullSearch extends BaseSearchResultPage {
  /* tabs */
  getTabEntry(automationId) {
    return this.getComponent(TabEntry, this.getSelectorByAutomationId(automationId));
  }

  get messagesTabEntry() {
    return this.getTabEntry('globalSearch-messages');
  }

  get peopleTabEntry() {
    return this.getTabEntry('globalSearch-people');
  }

  get groupsTabEntry() {
    return this.getTabEntry('globalSearch-groups');
  }

  get teamsTabEntry() {
    return this.getTabEntry('globalSearch-team');
  }

  get messagesTab() {
    return this.getComponent(MessagesResultTab)
  }

  get searchResultsCount() {
    return this.getSelectorByAutomationId('searchResultsCount', this.self)
  }

  async getCountOnHeader(): Promise<number> {
    if (!await this.searchResultsCount.exists) {
      return 0;
    }
    const text = await this.searchResultsCount.innerText;
    let count = +text.replace(/[^\d]/g, '');
    if (count) {
      return count
    }
    return 0;
  }

  async countOnHeaderShouldBe(n: number) {
    await H.retryUntilPass(async () => {
      const count = await this.getCountOnHeader();
      assert.ok(count == n, `expect ${n}, but ${count}`);
    }, 10, 1e3)
  }

  async countOnHeaderGreaterThanOrEqual(n: number) {
    await H.retryUntilPass(async () => {
      const count = await this.getCountOnHeader();
      assert.ok(count >= n, `expect at least ${n}, but ${count}`);
    }, 10, 1e3)
  }

  async countOnHeaderLessThanOrEqual(n: number) {
    await H.retryUntilPass(async () => {
      const count = await this.getCountOnHeader();
      assert.ok(count <= n, `expect less than or equal ${n}, but ${count}`);
    }, 10, 1e3)
  }

}

class MessagesResultTab extends BaseConversationPage {
  get self() {
    return this.getSelectorByAutomationId('search-message-panel');
  }
  /**  post */
  async allPostShouldBeByUser(name: string) {
    await H.retryUntilPass(async () => {
      const count = await this.posts.count;
      for (const i of _.range(count)) {
        await this.t.expect(this.postSenders.nth(i).textContent).eql(name);
      }
    })
  }

  get scrollDiv() {
    return this.stream.parent("div");
  }

  /* filter */
  get postByField() {
    return this.getComponent(SearchComoBox, this.self.find('#downshift-multiple-input').nth(0).parent('*[role="combobox"]'));
  }

  get postInField() {
    return this.getComponent(SearchComoBox, this.self.find('#downshift-multiple-input').nth(1).parent('*[role="combobox"]'));
  }

  get typeOptionSelector() {
    return this.getSelectorByAutomationId('typeSelector');
  }

  get timePostOptionSelector() {
    return this.getSelectorByAutomationId('timePostSelector');
  }

  async openTypeOptions() {
    await this.t.click(this.typeOptionSelector);
  }

  async openTimeOptions() {
    await this.t.click(this.timePostOptionSelector);
  }

  async selectTypeOfAll() {
    await this.t.click(this.getSelectorByAutomationId('typeSelector-All'));
  }

  async selectTypeOfMessages() {
    await this.t.click(this.getSelectorByAutomationId('typeSelector-Messages'));
  }

  async selectTypeOfEvents() {
    await this.t.click(this.getSelectorByAutomationId('typeSelector-Events'));
  }

  async selectTypeOfFiles() {
    await this.t.click(this.getSelectorByAutomationId('typeSelector-Files'));
  }

  async selectTypeOfLinks() {
    await this.t.click(this.getSelectorByAutomationId('typeSelector-Links'));
  }

  async selectTypeOfNotes() {
    await this.t.click(this.getSelectorByAutomationId('typeSelector-Notes'));
  }

  async selectTypeOfTasks() {
    await this.t.click(this.getSelectorByAutomationId('typeSelector-Tasks'));
  }
}


// TODO: Duplicate removal (RightRail)
class TabEntry extends BaseWebComponent {
  async enter() {
    return this.t.click(this.self);
  }

  get selected() {
    return this.self.getAttribute('aria-selected');
  }

  async shouldBeOpened() {
    await this.t.expect(this.selected).eql('true');
  }
}

class SearchItem extends BaseWebComponent {
  get avatar() {
    return this.getSelectorByAutomationId('search-item-avatar', this.self);
  }

  //recently content
  get contentIcon() {
    return this.getSelectorByIcon('history', this.avatar);
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
    return this.avatar.find('[cid]').getAttribute('cid');
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

  get privateLabel() {
    return this.findSelector('.lock.icon');
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

  get conferenceButton() {
    return this.getSelectorByAutomationIdUnderSelf('audio-conference-btn');
  }

  async hoverAndClickMessageButton() {
    await this.t.hover(this.self).click(this.messageButton);
  }

  async hoverAndClickConferenceButton() {
    await this.t.hover(this.self).click(this.conferenceButton);
  }
}


export class JoinTeamDialog extends BaseWebComponent {
  get self() {
    this.warnFlakySelector();
    return this.getSelector('*[role="dialog"]');
  }

  get title() {
    return this.getSelectorByAutomationId('DialogTitle').withText('Join team?')
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
    return this.buttonOfText('Join');
  }

  get joinButtonByClass() {
    return this.getSelector('.containedButtonStyle');
  }

  get cancelButton() {
    return this.buttonOfText('Cancel');
  }

  get cancelButtonByClass() {
    return this.getSelector('.textButtonStyle')
  }

  async clickJoinButton() {
    await this.t.click(this.joinButton);
  }

  async clickCancelButton() {
    await this.t.click(this.cancelButtonByClass);
  }
}
