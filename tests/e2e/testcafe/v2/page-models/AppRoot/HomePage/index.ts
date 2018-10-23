import * as _ from 'lodash';
import { BaseWebComponent } from "../../BaseWebComponent";
import { CreateTeamModal } from './CreateTeamModal';
import { AddActionMenu } from './AddActionMenu';
import { SettingMenu } from './SettingMenu';
import { LeftPanel } from './LeftPanel';
import { MessagePanel } from './MessagePanel'


export class HomePage extends BaseWebComponent {
    get root() {
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
        return this.root.find('button').child().withText('add_circle').parent().parent();
    }

    get addActionMenu() {
        return this.getComponent(AddActionMenu);
    }

    get createTeamModal() {
        return this.getComponent(CreateTeamModal);
    }

    get settingMenu() {
        return this.getComponent(SettingMenu);
    }

    async openAddActionMenu() {
        await this.t.click(this.addActionButton).hover('html');
    }
}