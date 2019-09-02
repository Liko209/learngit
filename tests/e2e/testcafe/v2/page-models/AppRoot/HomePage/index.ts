import * as _ from 'lodash';
import { h } from '../../../helpers';
import { BaseWebComponent } from "../../BaseWebComponent";
import { CreateTeamModal, ConvertToTeamDialog } from './CreateTeamModal';
import { SendNewMessageModal } from './SendNewMessage';
import { NewConversationDialog } from './NewConversation';
import { AddActionMenu } from './AddActionMenu';
import { SettingMenu } from './SettingMenu';
import { LeftPanel } from './LeftPanel';
import { MessageTab } from './MessageTab';
import { PostDeleteConfirmDialog } from './PostDeleteConfirmDialog';
import { Header, TopBarAvatar } from './header';
import { MiniProfile, ProfileDialog } from './ViewProfile';
import { AddTeamMembers } from './AddTeamMembers';
import { ShareStatusDialog } from './ShareStatusDialog';
import { TeamSettingDialog } from './TeamSettingDialog';
import { LeaveTeamDialog } from './LeaveTeamDialog';
import { TelephonyPOC } from './TelephonyPOC'

import { DeleteTeamDialog } from './DeleteTeamDialog';
import { ArchiveTeamDialog } from './ArchiveTeamDialog';
import { AlertDialog } from "./AlertDialog";
import { IUser } from '../../../models';
import { TelephonyDialog, TelephonyMinimizeWindow, ContactSearchList } from './TelephonyDialog';
import { FileAndImagePreviewer } from './ImagePreviewer';
import { ViewerDialog } from './ViewerDialog';
import { RecentConversationDialog } from './RecentConversationDialog';
import { SearchDialog, JoinTeamDialog } from './SearchDialog';
import { SettingTab } from './SettingTab';
import { LogoutDialog } from './LogoutDialog';
import { MoreActionOnFile, MoreActionOnViewer } from './MoreActionOnFile';
import { PhoneTab } from './PhoneTab';
import { DeleteVoicemailDialog } from './PhoneTab/Voicemail';
import { DeleteAllCalllDialog } from './PhoneTab/CallHistory';
import { DeleteCallHistoryDialog } from './PhoneTab/CallHistory';
import { BlockNumberDialog } from './PhoneTab/index';
import { AvatarEditDialog } from './AvatarEditDialog';
import { ProfileEditDialog } from './ProfileEditDialog';
import { AddressConfirmDialog, EmergencyConfirmDialog } from './E911';
import { NotificationPreferencesDialog } from './NotificationPreferences';
import {ContactsTab} from './ContactsTab';

export class HomePage extends BaseWebComponent {
  async ensureLoaded(timeout: number = 60e3, alwaysFocus: boolean = true, confirmE911Form: boolean = true) {
    await this.waitUntilExist(this.leftPanel, timeout)
    await this.waitForAllSpinnersToDisappear();
    if (confirmE911Form) {
      if (await this.emergencyConfirmFromEntry.exists) {
        await this.t
          .click(this.emergencyConfirmFromEntry)
          .click(this.emergencyConformButton);
      }
    }

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

  get emergencyConfirmFromEntry() {
    return this.getSelector('a').withText('Confirm address now.');
  }

  get emergencyConformButton() {
    // FIXME
    return this.getSelectorByAutomationId('e911-DialogOKButton');
  }



  get leftPanel() {
    return this.getComponent(LeftPanel);
  }

  get messageTab() {
    return this.getComponent(MessageTab);
  }

  get postDeleteConfirmDialog() {
    return this.getComponent(PostDeleteConfirmDialog);
  }

  get phoneTab() {
    return this.getComponent(PhoneTab);
  }

  get contactsTab() {
    return this.getComponent(ContactsTab);
  }


  get settingTab() {
    return this.getComponent(SettingTab);
  }

  get header() {
    return this.getComponent(Header);
  }

  get avatar() {
    return this.getComponent(TopBarAvatar);
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

  get newConversationDialog() {
    return this.getComponent(NewConversationDialog)
  }

  get miniProfile() {
    return this.getComponent(MiniProfile);
  }

  get profileDialog() {
    return this.getComponent(ProfileDialog);
  }

  get profileEditDialog() {
    return this.getComponent(ProfileEditDialog);
  }

  get topBarAvatar() {
    return this.getSelectorByAutomationId('topBarAvatar');
  }

  get avatarShortName() {
    return this.topBarAvatar.find('.avatar-short-name');
  }

  get avatarImage() {
    return this.topBarAvatar.find('img');
  }

  get dialpadButton() {
    return this.getSelectorByAutomationId('telephony-dialpad-btn');
  }

  get settingMenu() {
    return this.getComponent(SettingMenu);
  }

  get addTeamMemberDialog() {
    return this.getComponent(AddTeamMembers);
  }

  get ShareStatusDialog() {
    return this.getComponent(ShareStatusDialog);
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

  async hoverSettingMenu() {
    await this.t.hover(this.topBarAvatar, { speed: 0.1 });
  }

  async openDialer(closeE911Prompt: boolean = true) {
    await this.t.hover('html').click(this.dialpadButton);
    if (closeE911Prompt) {
      await this.closeE911Prompt();
    }
  }

  get e911AlertDialog() {
    return this.getSelectorByAutomationId('e911-prompt-dialog');
  }

  async closeE911Prompt() {
    const closeButton = this.getSelectorByAutomationId('emergencyConfirmDialogOkButton');
    if (await closeButton.exists) {
      await this.t.click(closeButton);
    }
  }

  get e911DialogCancelButton() {
    return this.getSelectorByAutomationId('e911-DialogCancelButton');
  }

  get e911DialogConfirmButton() {
    return this.getSelectorByAutomationId('e911-DialogOKButton');
  }

  async closeE911Form() {
    if (await this.e911DialogCancelButton.exists) {
      await this.t.click(this.e911DialogCancelButton);
    }
  }

  async confirmE911Form() {
    if (await this.e911DialogConfirmButton.exists) {
      await this.t.click(this.e911DialogConfirmButton);
    }
  }

  async hoverDialpadButton() {
    await this.t.hover(this.dialpadButton, { speed: 0.1 });
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

  get contactSearchList() {
    return this.getComponent(ContactSearchList);
  }

  get minimizeCallWindow() {
    return this.getComponent(TelephonyMinimizeWindow);
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

  get moreActionOnFile() {
    return this.getComponent(MoreActionOnFile);
  }

  get recentConversationDialog(){
    return this.getComponent(RecentConversationDialog);
  }

  get moreActionOnViewer() {
    return this.getComponent(MoreActionOnViewer);
  }

  get deleteVoicemailDialog() {
    return this.getComponent(DeleteVoicemailDialog);
  }

  get blockNumberDialog() {
    return this.getComponent(BlockNumberDialog)
  }

  get deleteAllCalllDialog() {
    return this.getComponent(DeleteAllCalllDialog);
  }

  get deleteCallHistoryDialog() {
    return this.getComponent(DeleteCallHistoryDialog);
  }

  get AvatarEditDialog() {
    return this.getComponent(AvatarEditDialog);
  }

  get addressConfirmDialog() {
    return this.getComponent(AddressConfirmDialog);
  }

  get emergencyConfirmDialog() {
    return this.getComponent(EmergencyConfirmDialog);
  }

  get notificationPreferencesDialog() {
    return this.getComponent(NotificationPreferencesDialog);
  }
}
