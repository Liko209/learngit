import * as assert from 'assert';
import { BaseWebComponent } from '../../BaseWebComponent';
import { ClientFunction } from 'testcafe';
import * as faker from 'faker/locale/en';


export class MiniProfile extends BaseWebComponent {
  async shouldBePopUp() {
    await this.t.expect(this.self.exists).ok();
  }

  async shouldBeDismissed() {
    await this.t.expect(this.self.exists).notOk();
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
    return this.footer.find('span').withText('Profile').parent('button'); // TODO: i18n
  }

  async openProfile() {
    await this.t.click(this.profileButton);
  }

  get privateButton() {
    return this.header.find('.privacy');
  }

  async clickPrivate() {
    await this.t.click(this.privateButton);
  }

  get messageButton() {
    return this.getSelectorByIcon('chat', this.footer).parent('button');
  }

  async goToMessages() {
    await this.t.click(this.messageButton);
  }

  get conferenceButton() {
    return this.getSelectorByAutomationIdUnderSelf('audio-conference-btn');
  }
  
  async clickConferenceButton() {
    await this.t.click(this.conferenceButton);
  }

  get unFavoriteStatusIcon() {
    return this.getSelectorByIcon("star_border", this.header);
  }

  get favoriteStatusIcon() {
    return this.getSelectorByIcon("star", this.header);
  }

  get telephonyButton() {
    return this.getSelectorByAutomationId('telephony-call-btn');
  }

  get telephonyIcon() {
    return this.getSelectorByIcon('phone', this.self);
  }

  async clickTelephonyButton() {
    await this.t.hover(this.self).click(this.telephonyButton);
  }
}

export class ProfileDialog extends BaseWebComponent {
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

  get favoriteButton() {
    return this.getSelectorByAutomationId('favorite-icon', this.self);
  }

  async clickFavoriteButton() {
    await this.t.click(this.favoriteButton);
  }

  async hoverFavoriteButton() {
    await this.t.hover(this.favoriteButton);
  }

  get unFavoriteStatusIcon() {
    return this.getSelectorByIcon("star_border", this.favoriteButton);
  }

  async clickUnFavoriteButton() {
    await this.t.click(this.unFavoriteStatusIcon);
  }

  async hoverUnFavoriteButton() {
    await this.t.hover(this.unFavoriteStatusIcon);
  }

  get favoriteStatusIcon() {
    return this.getSelectorByIcon("star", this.favoriteButton);
  }

  get content() {
    return this.getSelectorByAutomationId('profileDialogContent');
  }

  get membersAvatar() {
    return this.visualList.find('[uid]').nth(0);
  }

  async clickMembersAvatar() {
    await this.t.click(this.membersAvatar);
  }

  async clickEditProfile() {
    await this.t.click(this.editProfileButton);
  }

  async hoverEditProfile() {
    await this.t.hover(this.editProfileButton);
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
    return this.getSelectorByIcon('chat', this.summary);
  }

  async goToMessages() {
    await this.t.click(this.messageButton);
  }

  get conferenceIcon() {
    return this.getSelectorByIcon('conference', this.summary);
  }

  async clickConferenceIcon() {
    await this.t.click(this.conferenceIcon);
  }

  get editProfileButton() {
    return this.getSelectorByAutomationId('editProfileIcon', this.self);
  }

  get closeButton() {
    return this.getSelectorByIcon('close');
  }

  async clickCloseButton() {
    await this.t.click(this.closeButton);
  }

  async shouldBeId(id: string) {
    const currentId = await this.getId();
    assert.ok(currentId == id, `Profile owner Id, expect: ${id}, but actual: ${currentId}`);
  }


  // people only
  get telephonyButton() {
    return this.telephonyIcon.parent('button');
  }

  get telephonyIcon() {
    return this.getSelectorByIcon('phone', this.self);
  }

  async clickTelephonyButton() {
    await this.t.click(this.telephonyButton);
  }

  get moreItem() {
    return this.telephonyButton.parent('div');
  }

  async makeCall() {
    await this.t.hover(this.extensionArea).click(this.telephonyButton);
  }

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

  get extensionArea() {
    return this.extensionIcon.parent(1); //TODO: automation ID
  }

  get extensionNumber() {
    return this.extensionIcon.parent(0).find('div').withText('Ext').nextSibling('div');
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

  get memberSearch() {
    return this.getSelectorByAutomationId('profileDialogMemberSearch');
  }

  async countOnMemberHeaderShouldBe(n: number) {
    const reg = new RegExp(`\(${n}\)`)
    await this.t.expect(this.memberHeader.textContent).match(reg);
  }

  async countOnMemberListShouldBe(n: number) {
    await this.t.expect(this.memberNames.count).eql(n);
  }


  get visualList() {
    return this.getSelectorByAutomationId('virtualized-list', this.self);
  }

  get memberNames() {
    return this.getSelectorByAutomationId('profileDialogMemberListItemPersonName');
  }

  nthMemberEntry(n: number) {
    return this.getComponent(Member, this.visualList.find('[data-id]').nth(n));
  }

  memberEntryById(id: string) {
    return this.getComponent(Member, this.visualList.find(`[data-id="${id}"]`));
  }

  memberEntryByName(name: string) {
    return this.getComponent(Member, this.memberNames.withExactText(name).parent('li'));
  }

  get addMembersIcon() {
    return this.getSelectorByIcon('add_team', this.memberHeader);
  }

  async clickAddMembersIcon() {
    await this.t.click(this.addMembersIcon);
  }

  // team only
  get adminLabel() {
    return this.getSelectorByAutomationId('profileDialogMemberListItemPersonAdmin', this.self);
  }

  get guestLabel() {
    return this.getSelectorByAutomationId('profileDialogMemberListItemPersonGuest', this.self);
  }

  get privacyToggle() {
    return this.profileTitle.find('.privacy');
  }

  get publicIcon() {
    return this.getSelectorByIcon("lock_open", this.privacyToggle);
  }

  get privateIcon() {
    return this.getSelectorByIcon('lock', this.privacyToggle);
  }

  async shouldShowPublicIcon() {
    await this.t.expect(this.publicIcon.exists).ok();
    await this.t.expect(this.privateIcon.exists).notOk();
  }

  async shouldShowPrivateIcon() {
    await this.t.expect(this.publicIcon.exists).notOk();
    await this.t.expect(this.privateIcon.exists).ok();
  }

  async clickPrivacyToggle() {
    await this.t.click(this.privacyToggle);
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

  get profileType() {
    return this.profileTitle.getAttribute('data-profile-type');
  }

  async scrollToY(y) {
    const scrollDivElement = this.visualList;
    await ClientFunction((_y) => {
      scrollDivElement().scrollTop = _y;
    },
      { dependencies: { scrollDivElement } })(y);
  }

  async scrollToMiddle() {
    const scrollHeight = await this.visualList.scrollHeight;
    const clientHeight = await this.visualList.clientHeight;
    const middleHeight = (scrollHeight - clientHeight) / 2;
    await this.scrollToY(middleHeight);
  }


  async clickAvatar() {
    await this.t.click(this.avatar);
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

  get adminLabel() {
    return this.getSelectorByAutomationId('profileDialogMemberListItemPersonAdmin', this.self);
  }

  get guestLabel() {
    return this.getSelectorByAutomationId('profileDialogMemberListItemPersonGuest', this.self);
  }

  async showAdminLabel(timeout: number = 20e3) {
    await this.t.expect(this.adminLabel.exists).ok({ timeout });
  }

  async showGuestLabel() {
    await this.t.expect(this.guestLabel.exists).ok();
  }

  async showMemberLabel(timeout: number = 20e3) {
    await this.t.expect(this.adminLabel.exists).notOk({ timeout });
    await this.t.expect(this.guestLabel.exists).notOk({ timeout });
  }

  get moreButton() {
    return this.getSelectorByAutomationId('moreIcon', this.self);
  }

  async openMoreMenu() {
    await this.t.hover(this.self).click(this.moreButton);
  }

  get telephonyButton() {
    return this.telephonyIcon.parent('button'); //TODO: add automationId
  }

  get telephonyIcon() {
    return this.getSelectorByIcon('phone', this.self);
  }

  async clickTelephonyButton() {
    await this.t.hover(this.self).click(this.telephonyButton);
  }
}

class MoreMenu extends BaseWebComponent {
  get self() {
    return this.getSelector('ul[role="menu"]');
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
    await this.t.pressKey('esc');
  }
}

class MemberMoreMenu extends BaseWebComponent {
  get self() {
    return this.getSelector('ul[role="menu"]');
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
    await this.t.pressKey('esc');
  }
}
