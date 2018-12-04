/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-01 15:21:39
 * Copyright © RingCentral. All rights reserved.
 */
import { BaseWebComponent } from '../../BaseWebComponent';

export class CreateTeamModal extends BaseWebComponent {
  get self() {
    this.warnFlakySelector();
    return this.getSelector('*[role="dialog"]');
  }
  

  get cancelButton() {
    this.warnFlakySelector();
    return this.self.find('button').nth(0);
  }

  get CTself () {
    this.warnFlakySelector();
    return this.self.find('button').nth(1);
  }

  get createButton() {
    this.warnFlakySelector();
    return this.self.find('button').nth(1);
  }

  get toggleList() {
    this.warnFlakySelector();
    return this.self.find('[data-test-automation-id="CreateTeamToggleList"]');
  }

  get teamNameInput() {
    return this.self.find('input').nth(0);
  }

  private getToggleButton(index) {
    return this.toggleList.find('input').nth(index);
  }

  async clickPublicTeamButton() {
    await this.t.click(this.getToggleButton(0));
  }

  async clickMayPostButton() {
    await this.t.click(this.getToggleButton(1));
  }

  async setTeamName(teamName) {
    await this.t.typeText(this.teamNameInput, `${teamName}`, {
      replace: true,
    });
  }

  async inputTeamNameMax() {
    const name = [];
    for (let i = 0; i < 202; i++) {
      name.push(1);
    }
    await this.t.typeText(this.teamNameInput, name.join(''));
  }

  async clickCancelButton() {
    await this.t.click(this.cancelButton);
  }

  async clickCreateButton() {
    await this.t.click(this.createButton);
  }
 

  async click() {
    await this.t.click(this.self);
  }

  get isDisable(): Promise<boolean> {
    return this.CTself.hasAttribute('disabled');
  }

  async createTeamButtonShouldBeDisabled() {
    await this.t.expect(this.isDisable).ok();
  }

  async createdTeamButtonShouldBeEnabled() {
    await this.t.expect(this.isDisable).notOk();
  }

}