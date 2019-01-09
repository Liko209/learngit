import * as _ from 'lodash';
import { BaseWebComponent } from "../../BaseWebComponent";
import { CreateTeamModal } from './CreateTeamModal';
import { SendNewMessageModal } from './SendNewMessage';
import { AddActionMenu } from './AddActionMenu';
import { SettingMenu } from './SettingMenu';
import { LeftPanel } from './LeftPanel';
import { MessageTab } from './MessageTab';
import { Header } from './header';
import { LeftRail } from './LeftRail';
import { RightRail } from './RightRail';
import { MiniProfile, ProfileDialog } from './ViewProfile';

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

  get leftRail() {
    return this.getComponent(LeftRail);
  }

  get rightRail() {
    return this.getComponent(RightRail);
  }

  get messageTab() {
    return this.getComponent(MessageTab);
  }

  get header() {
    return this.getComponent(Header);
  }

  get addActionButton() {
    this.warnFlakySelector();
    return this.self.find('button').child().withText('new_actions').parent().parent();
  }

  get addActionMenu() {
    return this.getComponent(AddActionMenu);
  }

  get createTeamModal() {
    return this.getComponent(CreateTeamModal);
  }

  get sendNewMessageModal() {
    return this.getComponent(SendNewMessageModal);
  }

  get miniProfile() {
    return this.getComponent(MiniProfile);
  }

  get profileDialog() {
    return this.getComponent(ProfileDialog);
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
