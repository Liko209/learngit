
import { BaseWebComponent } from '../../BaseWebComponent';
import * as _ from 'lodash';

export class ViewProfile extends BaseWebComponent {
  get self() {
    this.warnFlakySelector();
    return this.getSelector('*[role="dialog"]');
  }

  get messageLink() {
    this.warnFlakySelector();
    return this.self.find('[aria-label="Go to the workstation of yourself"]');

  }
  async shouldExistviewProfile(profileText: string) {
    await this.t.expect(this.self.child().nextSibling('div').child().withText(profileText).exists).ok();
  }

}

class MiniProfile extends BaseWebComponent {
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

  get viewProfileButton() {
    this.warnFlakySelector();
    return this.footer.find('span').withText('Profile').parent('button');
  }

  async viewProfile() {
    await this.t.click(this.viewProfileButton);
  }

  get messageButton() {
    this.warnFlakySelector();
    return this.getSelectorByIcon('chat_bubble', this.footer).parent('button');
  }

  async goToMessages() {
    await this.t.click(this.messageButton);
  }
}

class ProfileModal extends BaseWebComponent {
  get self() {
    this.warnFlakySelector();
    return this.getSelector('*[role="dialog"]');
  }

  get profileTitle() {
    return this.getSelectorByAutomationId('profileDialogTitle');
  }

  async shouldBePopUp() {
    this.t.expect(this.profileTitle.withText('Profile')).ok();
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
    return this.getSelectorByIcon('chat_bubble', this.summary).parent('button');
  }

  async goToMessages() {
    await this.t.click(this.messageButton);
  }
  
  get form() {
    return this.getSelectorByAutomationId('profileDialogForm');
  }

  get companyIcon() {
    return this.getSelectorByIcon('work', this.form);
  }

  get companyName() {
    return this.companyIcon.parent(0).find('div').withText('Company').nextSibling('div').textContent;
  }

  get extensionIcon() {
    return this.getSelectorByIcon('call', this.form);
  }

  get extension() {
    return this.extensionIcon.parent(0).find('div').withText('Ext').nextSibling('div').textContent;
  }

  get emailIcon() {
    return this.getSelectorByIcon('email', this.form);
  }

  get emailAddress() {
    return this.emailIcon.parent(0).find('div').withText('Email').nextSibling('div').textContent;
  }

  // team
  get memberHeader() {
    return this.getSelectorByAutomationId('profileDialogMemberHeader');
  }

  async getMemberCount() {
    const text = await this.memberHeader.textContent;
    
  }

}