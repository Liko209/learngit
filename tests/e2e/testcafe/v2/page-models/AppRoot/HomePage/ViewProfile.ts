import * as assert from 'assert';
import { BaseWebComponent } from '../../BaseWebComponent';


export class MiniProfile extends BaseWebComponent {
  async shouldBePopUp() {
    await this.t.expect(this.self.exists).ok();
  }

  get self() {
    return this.getSelectorByAutomationId('profileMiniCard');
  }

  get header() {
    return this.getSelectorByAutomationId('profileMiniCardHeader');
  }

  get avatar() {
    return this.getSelectorByAutomationId('profileAvatar');
  }

  get uid() {
    return this.avatar.getAttribute('uid');
  }

  get personName() {
    return this.getSelectorByAutomationId('profileMiniCardPersonName');
  }

  get personState() {
    return this.getSelectorByAutomationId('profileMiniCardPersonState');

  }
  get personTitle() {
    return this.getSelectorByAutomationId('profileMiniCardPersonTitle');
  }

  get groupName() {
    return this.getSelectorByAutomationId('profileMiniCardGroupName');
  }

  get groupState() {
    return this.getSelectorByAutomationId('profileMiniCardGroupState');

  }
  get groupTitle() {
    return this.getSelectorByAutomationId('profileMiniCardGroupTitle');
  }

  get footer() {
    return this.getSelectorByAutomationId('profileMiniCardFooter');
  }

  async getName() {
    if (await this.personName.exists) {
      return await this.personName.textContent
    }
    return await this.groupName.textContent;
  }

  async getId() {
    if (await this.avatar.hasAttribute('cid')) {
      return await this.avatar.getAttribute('cid');
    }
    return await this.avatar.getAttribute('uid');
  }

  async shouldBeName(name: string) {
    const currentName = await this.getName();
    await this.t.expect(currentName).eql(name);
    assert.strictEqual(name, currentName, `Profile owner name, expect: ${name}, but actual: ${currentName}`);
  }

  async shouldBeId(id: string) {
    const currentId = await this.getId();
    assert.strictEqual(id, currentId, `Profile owner Id, expect: ${id}, but actual: ${currentId}`);
  }

  get profileButton() {
    this.warnFlakySelector();
    return this.footer.find('span').withText('Profile').parent('button');
  }

  async openProfile() {
    await this.t.click(this.profileButton);
  }

  get privateButton() {
    this.warnFlakySelector();
    return this.header.find('.privacy');
  }

  async clickPrivate() {
    await this.t.click(this.privateButton);
  }

  get messageButton() {
    this.warnFlakySelector();
    return this.getSelectorByIcon('chat_bubble', this.footer).parent('button');
  }

  async goToMessages() {
    await this.t.click(this.messageButton);
  }

  get unFavoriteStatusIcon() {
    return this.getSelectorByIcon("star_border", this.header);
  }

  get favoriteStatusIcon() {
    return this.getSelectorByIcon("star", this.header);
  }
}

export class ProfileDialog extends BaseWebComponent {
  public id: Promise<string>;

  async getId() {
    if (await this.avatar.hasAttribute('cid')) {
      return await this.cid;
    }
    return await this.uid;
  }

  get self() {
    this.warnFlakySelector();
    return this.getSelector('*[role="dialog"]');
  }

  get profileTitle() {
    return this.getSelectorByAutomationId('profileDialogTitle');
  }

  get exists() {
    return this.profileTitle.exists;
  }

  async shouldBePopUp() {
    await this.t.expect(this.profileTitle.exists).ok();
  }

  get favoriteButton() {
    return this.getSelectorByAutomationId('favorite-icon', this.self);
  }

  get unFavoriteStatusIcon() {
    return this.getSelectorByIcon("star_border", this.favoriteButton);
  }

  get favoriteStatusIcon() {
    return this.getSelectorByIcon("star", this.favoriteButton);
  }

  get content() {
    return this.getSelectorByAutomationId('profileDialogContent');
  }

  get status() {
    return this.getSelectorByAutomationId('profileDialogSummaryStatus');
  }

  get description() {
    return this.getSelectorByAutomationId('profileDialogSummaryDescription');
  }

  get summaryTitle() {
    return this.getSelectorByAutomationId('profileDialogSummaryTitle');
  }

  get summary() {
    return this.getSelectorByAutomationId('profileDialogSummary');
  }

  get avatar() {
    return this.getSelectorByAutomationId('profileAvatar');
  }

  get name() {
    return this.getSelectorByAutomationId('profileDialogSummaryName');
  }

  get messageButton() {
    return this.getSelectorByIcon('chat_bubble', this.summary);
  }

  async goToMessages() {
    await this.t.click(this.messageButton);
  }

  get closeButton() {
    this.warnFlakySelector();
    return this.getSelectorByIcon('close');
  }

  async close() {
    await this.t.click(this.closeButton);
  }

  async shouldBeId(id: string) {
    await this.t.expect(this.id).eql(id, `Profile owner Id, expect: ${id}, but actual: ${this.id}`)
  }


  // people only
  get formArea() {
    return this.getSelectorByAutomationId('profileDialogForm');
  }

  get companyIcon() {
    return this.getSelectorByIcon('work', this.formArea);
  }

  get companyName() {
    return this.companyIcon.parent(0).find('div').withText('Company').nextSibling('div').textContent;
  }

  get extensionIcon() {
    return this.getSelectorByIcon('call', this.formArea);
  }

  get extension() {
    return this.extensionIcon.parent(0).find('div').withText('Ext').nextSibling('div').textContent;
  }

  get emailIcon() {
    return this.getSelectorByIcon('email', this.formArea);
  }

  get emailAddress() {
    return this.emailIcon.parent(0).find('div').withText('Email').nextSibling('div').textContent;
  }

  get uid() {
    return this.avatar.getAttribute('uid');
  }


  // team & group
  get cid() {
    return this.avatar.getAttribute('cid');
  }

  get memberHeader() {
    return this.getSelectorByAutomationId('profileDialogMemberHeader');
  }

  async countOnMemberHeaderShouldBe(n: number) {
    const reg = new RegExp(`\(${n}\)`)
    await this.t.expect(this.memberHeader.textContent).match(reg);
  }

  async countOnMemberListShouldBe(n: number) {
    await this.t.expect(this.memberNames.count).eql(n);
  }

  get memberList() {
    return this.self.find('*[role="rowgroup"]');
  }

  get memberNames() {
    return this.getSelectorByAutomationId('profileDialogMemberListItemPersonName');
  }

  nthMemberEntry(n: number) {
    return this.getComponent(Member, this.memberList.find('*').withAttribute('data-id').nth(n));
  }

  memberEntryById(id: string) {
    return this.getComponent(Member, this.memberList.find(`[data-id=${id}]`));
  }

  memberEntryByName(name: string) {
    return this.getComponent(Member, this.memberNames.withExactText(name).parent(0));
  }

  get addMembersIcon() {
    return this.getSelectorByIcon('add_team',this.memberHeader);
  }

  async clickAddMembersIcon() {
    await this.t.click(this.addMembersIcon);
  }

  // team only
  get privateButton() {
    return this.profileTitle.find('.privacy');
  }

  get publicIcon() {
    return this.getSelectorByIcon("lock_open", this.privateButton);
  }

  get privateIcon() {
    return this.getSelectorByIcon('lock', this.privateButton);
  }

  async clickPrivate() {
    await this.t.click(this.privateButton);
  }

  get settingButton() {
    return this.getSelectorByAutomationId('settingButton');
  }

  get settingIcon() {
    return this.getSelectorByIcon('settings', this.settingButton);
  }

  async clickSetting() {
    return this.t.click(this.settingButton);
  }

  get moreButton() {
    return this.getSelectorByAutomationId('actionBarMore', this.profileTitle);
  }

  get moreIcon() {
    return this.getSelectorByIcon("more_horiz", this.profileTitle);
  }

  async openMoreMenu() {
    await this.t.click(this.moreButton);
  }

  get moreMenu() {
    return this.getComponent(MoreMenu);
  }

  get memberMoreMenu() {
    return this.getComponent(MemberMoreMenu);
  }
  get joinTeamButton() {
    return this.getSelectorByIcon('add_member');
  }

  async joinTeam() {
    await this.t.click(this.joinTeamButton);
  }

}
class Member extends BaseWebComponent {
  get uid() {
    return this.self.getAttribute('data-id');
  }

  get avatar() {
    return this.self.find('div').filter((el) => el.hasAttribute('uid'))
  }

  get personName() {
    return this.getSelectorByAutomationId('profileDialogMemberListItemPersonName', this.self);
  }

  get admin() {
    return this.getSelectorByAutomationId('profileDialogMemberListItemPersonAdmin', this.self);
  }

  isAdmin(): Promise<boolean> {
    return this.admin.exists
  }

  async shouldBeAdmin() {
    await this.t.expect(this.isAdmin).ok();
  }

  async shouldBeMemberOnly() {
    await this.t.expect(this.isAdmin).notOk();
  }

  get moreButton() {
    return this.getSelectorByAutomationId('moreIcon', this.self);
  }

  async openMoreMenu() {
    await this.t.hover(this.self).click(this.moreButton);
  }

}

class MoreMenu extends BaseWebComponent {
  get self() {
    return this.getSelector('div[role="document"]');
  }

  get copyUrlMenuItem() {
    return this.self.find('li[role="menuitem"]').withText('Copy URL');
  }

  get copyEmailMenuItem() {
    return this.self.find('li[role="menuitem"]').withText('Copy Email');
  }

  async clickCopyUrl() {
    await this.t.click(this.copyUrlMenuItem);
  }
  async clickCopyEmail() {
    await this.t.click(this.copyEmailMenuItem);
  }

  async quit() {
    await this.t.pressKey('ESC');
  }
}

class MemberMoreMenu extends BaseWebComponent {
  get self() {
    return this.getSelector('div[role="document"]');
  }

  get removeFromTeamItem() {
    return this.getSelectorByAutomationId('removeFromTeam');
  }

  get makeTeamAdminItem() {
    return this.getSelectorByAutomationId('makeTeamAdmin');
  }

  get revokeTeamAdminItem() {
    return this.getSelectorByAutomationId('revokeTeamAdmin');
  }

  async clickRemoveTeamMember() {
    await this.t.click(this.removeFromTeamItem);
  }

  async clickMakeTeamAdmin() {
    await this.t.click(this.makeTeamAdminItem);
  }

  async clickRevokeTeamAdmin() {
    await this.t.click(this.revokeTeamAdminItem);
  }
  
  async quit() {
    await this.t.pressKey('ESC');
  }
}