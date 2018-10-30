import { BaseWebComponent } from "../../BaseWebComponent";
export class SettingMenu extends BaseWebComponent {
    get root() {
        return this.getSelector('#root');
    }
    get menu() {
        return this.getSelectorByAutomationId('avatarMenu');
    }
    get logoutButton() {
        return this.getSelectorByAutomationId('signOut');
    }
    get topBarAvatar() {
        return this.getSelectorByAutomationId('topBarAvatar');
    }
    async menuExists() {
        await this.t.expect(this.menu.exists).ok();
    }
    async clickTopBarAvatar() {
        await this.t.click(this.topBarAvatar);
    }
    async clickLogout() {
        await this.t.click(this.logoutButton);
    }

}