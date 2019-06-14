import 'testcafe';
import * as assert from 'assert';

import { BaseWebComponent } from '../BaseWebComponent';


export class UpgradeDialog extends BaseWebComponent {

  get self() {
    return this.getSelector('*[role="document"]');
  }

  get title() {
    return this.self.find('h2');

  }
  async titleShouldBe(text: string) {
    await this.t.expect(this.title.textContent).eql(text);
  }

  get message() {
    return this.self.find('p');
  }

  async messageShouldBe(text: string) {
    await this.t.expect(this.message.textContent).eql(text);
  }

  buttonByAriaLabel(label: string) {
    return this.self.find(`[aria-label="${label}"]`);
  }

  get notNowButton() {
    return this.buttonByAriaLabel('Now Now');
  }

  async clickNotNowButton() {
    await this.t.click(this.notNowButton);
  }

  get ignoreButton() {
    return this.buttonByAriaLabel('Ignore');
  }

  async clickIgnoreButton() {
    await this.t.click(this.ignoreButton);
  }

  get upgradeButton() {
    return this.buttonByAriaLabel('Upgrade');
  }

  async clickUpgradeButton() {
    await this.t.click(this.upgradeButton);
  }

  get upgradeUrl() {
    return this.upgradeButton.getAttribute('href');
  }

  get okButton() {
    return this.buttonByAriaLabel('OK');
  }

  async clickOkButton() {
    await this.t.click(this.okButton);
  }

}
