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
}

export class ProfileDialog extends BaseWebComponent {
  get self() {
    this.warnFlakySelector();
    return this.getSelector('*[role="dialog"]');
  }

  get exists() {
    return this.profileTitle.exists;
  }

  get profileTitle() {
    return this.getSelectorByAutomationId('profileDialogTitle');
  }

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
  
  get unFavoriteStatusIcon() {
    return this.getSelectorByIcon("star_border", this.profileTitle);
  }

  get favoriteStatusIcon() {
    return this.getSelectorByIcon("star", this.profileTitle);
  }

  get moreIcon() {
    return this.getSelectorByIcon("more_horiz", this.profileTitle);
  }

  async openMoreMenu() {
    await this.t.click(this.moreIcon);
  }

  get moreMenu() {
    return this.getComponent(MoreMenu);
  }

  async shouldBePopUp() {
    await this.t.expect(this.profileTitle.exists).ok();
  }

  async shouldBeId(id: string) {
    const currentId = await this.getId();
    assert.strictEqual(id, currentId, `Profile owner Id, expect: ${id}, but actual: ${currentId}`);
  }

  get closeButton() {
    this.warnFlakySelector();
    return this.getSelectorByIcon('close');
  }

  get content() {
    return this.getSelectorByAutomationId('profileDialogContent');
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

  get status() {
    return this.getSelectorByAutomationId('profileDialogSummaryStatus');
  }

  get summaryTitle() {
    return this.getSelectorByAutomationId('profileDialogSummaryTitle');
  }

  get messageButton() {
    return this.getSelectorByIcon('chat_bubble', this.summary);
  }

  async goToMessages() {
    await this.t.click(this.messageButton);
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

  get extension() {
    return this.extensionIcon.parent(0).find('div').withText('Ext').nextSibling('div').textContent;
  }

  get emailIcon() {
    return this.getSelectorByIcon('email', this.formArea);
  }

  get emailAddress() {
    return this.emailIcon.parent(0).find('div').withText('Email').nextSibling('div').textContent;
  }

  // team
  get memberHeader() {
    return this.getSelectorByAutomationId('profileDialogMemberHeader');
  }

  async getMemberCount(): Promise<number> {
    const text = await this.memberHeader.textContent;
    const count = text.match(/\((\d+)\)/).pop().replace("(", "").replace(")", "");
    return Number(count);
  }

  get memberList() {
    return this.getSelectorByAutomationId('profileDialogMemberList');
  }

  memberEntryById(id: string) {
    return this.getComponent(Member, this.memberList.find(`li[data-id=${id}]`));
  }


  async getId() {
    if (await this.avatar.hasAttribute('cid')) {
      return await this.avatar.getAttribute('cid');
    }
    return await this.avatar.getAttribute('uid');
  }

  async close() {
    await this.t.click(this.closeButton);
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
