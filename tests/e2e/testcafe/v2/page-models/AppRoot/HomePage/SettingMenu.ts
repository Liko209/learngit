import { BaseWebComponent } from "../../BaseWebComponent";

export class SettingMenu extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId('avatarMenu');
  }

  get logoutButton() {
    return this.getSelectorByAutomationId('signOut', this.self);
  }

  get viewYourProfileButton() {
    return this.getSelectorByAutomationId('viewYourProfile', this.self);
  }

  async clickViewYourProfile() {
    await this.t.click(this.viewYourProfileButton);
  }

  get AboutButton() {
    return this.getSelectorByAutomationId('aboutPage', this.self);
  }

  async clickAboutButton() {
    await this.t.click(this.AboutButton);
  }

  async clickLogout() {
    await this.t.click(this.logoutButton);
  }

}
