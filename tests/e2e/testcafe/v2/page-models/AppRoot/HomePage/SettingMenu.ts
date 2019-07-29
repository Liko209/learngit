import { BaseWebComponent } from "../../BaseWebComponent";
import { HomePage } from ".";

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

  get aboutButton() {
    return this.getSelectorByAutomationId('aboutPage', this.self);
  }

  async clickAboutButton() {
    await this.t.click(this.aboutButton);
  }

  async clickLogout() {
    await this.t.click(this.logoutButton);
  }

  get presenceMenuButton() {
    return this.getSelectorByAutomationId('presence-menu-button', this.self);
  }

  async hoverPresenceMenuButton() {
    await this.t.hover(this.presenceMenuButton);
  }

  get presenceSubMenuDndButton() {
    return this.getSelectorByAutomationId('presence-submenu-dnd');
  }

  async clickPresenceSubMenuDndButton() {
    await this.t.click(this.presenceSubMenuDndButton);
  }

  get presenceSubMenuAvailableButton() {
    return this.getSelectorByAutomationId('presence-submenu-available');
  }

  async clickPresenceSubMenuAvailableButton() {
    await this.t.click(this.presenceSubMenuAvailableButton);
  }

  get presenceSubMenuInvisibleButton() {
    return this.getSelectorByAutomationId('presence-submenu-invisible');
  }

  async clickPresenceSubMenuInvisibleButton() {
    await this.t.click(this.presenceSubMenuInvisibleButton);
  }

  get dndTopBanner() {
    return this.getSelectorByAutomationId('dnd-top-banner');
  }

  get dndUnblockButton() {
    return this.getSelectorByAutomationId('dnd-top-banner-unblock');
  }

  async clickDndUnblockButton() {
    await this.t.click(this.dndUnblockButton);
  }

}
