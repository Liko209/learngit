import * as _ from 'lodash';
import { h } from '../../../helpers';
import { BaseWebComponent } from "../../BaseWebComponent";
import { CreateTeamModal, ConvertToTeamDialog } from './CreateTeamModal';
import { SendNewMessageModal } from './SendNewMessage';
import { AddActionMenu } from './AddActionMenu';
import { SettingMenu } from './SettingMenu';
import { LeftPanel } from './LeftPanel';
import { MessageTab } from './MessageTab';
import { Header } from './header';
import { MiniProfile, ProfileDialog } from './ViewProfile';
import { AddTeamMembers } from './AddTeamMembers';
import { TeamSettingDialog } from './TeamSettingDialog';
import { LeaveTeamDialog } from './LeaveTeamDialog';
import { TelephonyPOC } from './TelephonyPOC'

import { DeleteTeamDialog } from './DeleteTeamDialog';
import { ArchiveTeamDialog } from './ArchiveTeamDialog';
import { AlertDialog } from "./AlertDialog";
import { IUser } from '../../../models';
import { TelephonyDialog } from './TelephonyDialog';
import { FileAndImagePreviewer } from './ImagePreviewer';
import { ViewerDialog } from './ViewerDialog';
import { SearchDialog, JoinTeamDialog } from './SearchDialog';
import { SettingTab } from './SettingTab';
import { LogoutDialog } from './LogoutDialog';

export class HomePage extends BaseWebComponent {
  async ensureLoaded(timeout: number = 60e3, alwaysFocus: boolean = true) {
    await this.waitUntilExist(this.leftPanel, timeout)
    await this.waitForAllSpinnersToDisappear();
    if (alwaysFocus)
      await h(this.t).interceptHasFocus(true);
  }

  get self() {
    return this.getSelector('#root');
  }

  async logout() {
    await this.openSettingMenu();
    await this.settingMenu.clickLogout();
    await this.t.expect(h(this.t).href).contains('unified-login');
  }

  async logoutThenLoginWithUser(url: string, user: IUser) {
    await this.logout();
    await h(this.t).directLoginWithUser(url, user);
    await this.ensureLoaded();
  }

  get leftPanel() {
    return this.getComponent(LeftPanel);
  }

  get messageTab() {
    return this.getComponent(MessageTab);
  }

  get settingTab() {
    return this.getComponent(SettingTab);
  }

  get header() {
    return this.getComponent(Header);
  }

  get addActionButton() {
    this.warnFlakySelector();
    return this.self.find('button').child().find('.icon.new_actions');
  }

  get addActionMenu() {
    return this.getComponent(AddActionMenu);
  }

  get createTeamModal() {
    return this.getComponent(CreateTeamModal);
  }

  get convertToTeamModal() {
    return this.getComponent(ConvertToTeamDialog);
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

  get addTeamMemberDialog() {
    return this.getComponent(AddTeamMembers);
  }

  get teamSettingDialog() {
    return this.getComponent(TeamSettingDialog)
  }

  async openAddActionMenu() {
    await this.t.hover('html').click(this.addActionButton);
  }

  async openSettingMenu() {
    await this.t.click(this.topBarAvatar);
  }

  get joinTeamDialog() {
    return this.getComponent(JoinTeamDialog);
  }

  get leaveTeamDialog() {
    return this.getComponent(LeaveTeamDialog);
  }

  get telephonyPOCPage() {
    return this.getComponent(TelephonyPOC);
  }
  get deleteTeamDialog() {
    return this.getComponent(DeleteTeamDialog);
  }

  get archiveTeamDialog() {
    return this.getComponent(ArchiveTeamDialog);
  }

  get alertDialog() {
    return this.getComponent(AlertDialog);
  }

  get telephonyDialog() {
    return this.getComponent(TelephonyDialog);
  }

  get fileAndImagePreviewer() {
    return this.getComponent(FileAndImagePreviewer);
  }

  get viewerDialog() {
    return this.getComponent(ViewerDialog);
  }

  get searchDialog() {
    return this.getComponent(SearchDialog);
  }

  get logoutDialog() {
    return this.getComponent(LogoutDialog);
  }

}
