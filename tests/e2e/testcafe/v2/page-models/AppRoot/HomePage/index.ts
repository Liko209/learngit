import * as _ from 'lodash';
import { BaseWebComponent } from "../../BaseWebComponent";
import { CreateTeamModal } from './CreateTeamModal';
import { AddActionMenu } from './AddActionMenu';
import { SettingMenu } from './SettingMenu';
import { LeftPanel } from './LeftPanel';
import { MessagePanel } from './MessagePanel'


export class HomePage extends BaseWebComponent {
    async ensureLoaded() {
        await this.waitUntilExist(this.leftPanel, 60e3);
    }

    get self() {
        return this.getSelector('#root');
    }

    get leftPanel() {
        return this.getComponent(LeftPanel);
    }

    get messagePanel() {
        return this.getComponent(MessagePanel);
    }

    get addActionButton() {
        this.warnFlakySelector();
        return this.self.find('button').child().withText('add_circle').parent().parent();
    }

    get addActionMenu() {
        return this.getComponent(AddActionMenu);
    }

    get createTeamModal() {
        return this.getComponent(CreateTeamModal);
    }

    get topBarAvatar() {
        return this.getSelectorByAutomationId('topBarAvatar');
    }

    get settingMenu() {
        return this.getComponent(SettingMenu);
    }

    async openAddActionMenu() {
        await this.t.hover('html').click(this.addActionButton);
    }

    async openSettingMenu() {
        await this.t.click(this.topBarAvatar);
    }

}