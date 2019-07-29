/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-07-24 14:03:11
 * Copyright © RingCentral. All rights reserved.
 */

import { BaseWebComponent } from '../../BaseWebComponent';
import { SearchComoBox } from './SearchComboBox';

export class NewConversationDialog extends BaseWebComponent {
  get exists() {
    return this.title.withExactText('New conversation').exists;
  }

  get self() {
    return this.getSelector('*[role="dialog"]');
  }

  get title() {
    return this.getSelectorByAutomationId('DialogTitle');
  }

  get description() {
    return this.getSelectorByAutomationId('newConversationDescription');
  }

  get convertToTeam() {
    return this.description.find('a');
  }

  async clickConvertToTeam() {
    await this.t.click(this.convertToTeam);
  }

  get memberInput() {
    return this.getComponent(SearchComoBox, this.self.find('*[role="combobox"]'));
  }

  get selectedItems() {
    return this.memberInput.getSelector('*[role="button"]');
  }

  get selectedMembers() {
    return this.selectedItems.find('[uid]').parent('[role="button"]');
  }

  get dialogActions() {
    return this.getSelectorByAutomationId('DialogActions');
  }

  get cancelButton() {
    return this.dialogActions.find('button').nth(0);
  }

  get createButton() {
    return this.dialogActions.find('button').nth(1);
  }

  async clickCancelButton() {
    await this.t.click(this.cancelButton);
  }

  async clickCreateButton() {
    await this.t.click(this.createButton);
  }

  get isDisable(): Promise<boolean> {
    return this.createButton.hasAttribute('disabled');
  }

  async createButtonShouldBeDisabled() {
    await this.t.expect(this.isDisable).ok();
  }

  async createButtonShouldBeEnabled() {
    await this.t.expect(this.isDisable).notOk();
  }
}
