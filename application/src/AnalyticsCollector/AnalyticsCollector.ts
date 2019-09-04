/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-04-08 15:28:50
 * Copyright © RingCentral. All rights reserved.
 */
import { dataAnalysis } from 'foundation/analysis';
import { getGlobalValue, getEntity } from '@/store/utils';
import { GLOBAL_KEYS, ENTITY_NAME } from '@/store/constants';
import { fetchVersionInfo } from '@/containers/VersionInfo/helper';
import config from '@/config';
import PersonModel from '@/store/models/Person';
import { Person } from 'sdk/module/person/entity';
import { Company } from 'sdk/module/company/entity';
import CompanyModel from '@/store/models/Company';
import { PRESENCE } from 'sdk/module/presence/constant';
import { PHONE_TAB, PHONE_ITEM_ACTIONS } from './constants';
import { ConversationType, NewConversationSource, SendTrigger } from './types';

class AnalyticsCollector {
  constructor() {
    dataAnalysis.setProduction(config.isProductionAccount());
  }

  reset() {
    dataAnalysis.reset();
  }

  async identify() {
    const userId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
    if (!userId) {
      return { userId };
    }
    const user = getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, userId);
    if (!user.companyId) {
      return { userId, user };
    }
    const company = getEntity<Company, CompanyModel>(
      ENTITY_NAME.COMPANY,
      user.companyId,
    );
    if (!user.email || !company.name) {
      return;
    }
    const { email, companyId, inviterId, displayName } = user;
    const { name, rcAccountId } = company;
    const version = await fetchVersionInfo();
    const properties = {
      email,
      companyId,
      rcAccountId,
      companyName: name,
      name: displayName,
      id: userId,
      signupType: inviterId ? 'viral' : 'organic',
      accountType: rcAccountId ? 'rc' : 'non-rc',
      appVersion: version.deployedVersion,
    };
    const jupiterElectron = window['jupiterElectron'];
    if (jupiterElectron && jupiterElectron.getElectronVersionInfo) {
      const { electronAppVersion } = jupiterElectron.getElectronVersionInfo();
      properties['desktopVersion'] = electronAppVersion;
    }
    dataAnalysis.identify(userId, properties);
    return;
  }

  page(name: string, properties?: any) {
    dataAnalysis.page(name, properties);
  }

  /* analysis event collector start
     event function should use event name witch comes from ticket title

     note: dev dont need to add endPoint if it parameters have other properties,
           but if the parameter only has one property named "endPoint",
           please remember to pass "{}" if the ticket need endPoint
     e.g:
     {name: "test"} => {value: "test", endPoint:"win32"}
     {} => {endPoint:"win32"}
     undefined/null => undefined/null

  */
  // [FIJI-4303] Segment - add event - make outbound call
  makeOutboundCall(source: string) {
    const info = {
      source,
      type: 'call',
    };
    dataAnalysis.track('Jup_Web/DT_phone_outboundCall', info);
  }

  // [FIJI-3202] Segment - Add event - Send post / [FIJI-8303] Post Button for Attachments
  sendPost(
    trigger: SendTrigger,
    source: string,
    postType: string,
    destination: string,
    atTeam = 'no',
  ) {
    dataAnalysis.track('Jup_Web/DT_msg_postSent', {
      trigger,
      source,
      postType,
      destination,
      atTeam,
    });
  }

  // [FIJI-4573] Segment - Add event - All Calls
  seeAllCalls() {
    this.page('Jup_Web/DT_phone_callHistory_allCalls', {});
  }

  seeMissedCalls() {
    this.page('Jup_Web/DT_phone_callHistory_missedCalls', {});
  }

  seeVoicemailListPage() {
    this.page('Jup_Web/DT_phone_voicemailHistory', {});
  }

  // [FIJI-4687] Segment - Block/Unblock a number
  blockNumber(source: string) {
    dataAnalysis.track('Jup_Web/DT_phone_blockNumber', {
      source,
    });
  }

  // [FIJI-963] set presence
  setPresence(source: PRESENCE) {
    dataAnalysis.track('Jup_Web/DT_appOptions_setPresence', {
      source,
    });
  }

  unblockNumber(source: string) {
    dataAnalysis.track('Jup_Web/DT_phone_unblockNumber', {
      source,
    });
  }

  // [FIJI-6851] [FIJI-4798] Segment - Add event - click action button
  phoneActions(tab: PHONE_TAB, actions: PHONE_ITEM_ACTIONS) {
    dataAnalysis.track(`Jup_Web/DT_phone_${tab}Actions`, {
      actions,
    });
  }

  contactActions(source: string, action: string, contactType: string) {
    dataAnalysis.track('Jup_Web/DT_contacts_actionOverContact', {
      action,
      source,
      contactType,
    });
  }

  // [FIJI-4573] Segment - Add event - open contact's min profile
  openMiniProfile(source: string) {
    dataAnalysis.track('Jup_Web/DT_profile_openMiniProfile', {
      source,
    });
  }

  // [FIJI-4724] Segment - Add event - Play Voicemail
  playPauseVoicemail(action: string) {
    dataAnalysis.track('Jup_Web/DT_voicemail_playPauseVoicemail', {
      action,
    });
  }

  activeCall() {
    dataAnalysis.track('Jup_Web/DT_call_activeCall');
  }

  flipNumberList() {
    dataAnalysis.track('Jup_Web/DT_call_activeCall_flipNumberList');
  }

  flipCall() {
    dataAnalysis.track('Jup_Web/DT_call_flipCall', {
      source: 'activeCall_flipNumberList',
    });
  }

  clearAllCallHistory() {
    dataAnalysis.track('Jup_Web/DT_phone_callHistory_deleteAll');
  }

  // [FIJI-5138] Segment - Add event - Recent Call Logs
  recentCallLogs() {
    dataAnalysis.track('Jup_Web/DT_phone_dialer_callHistory');
  }

  goToConversation(source: string, conversationType?: string) {
    dataAnalysis.track('Jup_Web/DT_msg_goToConversation', {
      source,
      conversationType,
    });
  }

  phoneCallBack(source: string) {
    dataAnalysis.track('Jup_Web/DT_phone_outboundCall', {
      source,
    });
  }

  // [FIJI-7269]
  conversationAddPerson(
    conversationType: ConversationType,
    source: NewConversationSource,
  ) {
    dataAnalysis.track('Jup_Web/DT_msg_addPerson', {
      conversationType,
      source,
    });
  }

  e911Setting() {
    dataAnalysis.track('Jup_Web/DT_settings_updateE911Address');
  }

  // [FIJI-7325]
  openCallSwitch(source: string) {
    dataAnalysis.track('Jup_Web/DT_clickCallSwitch', {
      source,
    });
  }

  confirmCallSwitch(source: string) {
    dataAnalysis.track('Jup_Web/DT_confirmCallSwitch', {
      source,
    });
  }

  // FIJI-7829
  showGlobalDialog() {
    dataAnalysis.track('Jup_Web/DT_search_globalSearchDialog');
  }

  showFullMessageSearch() {
    dataAnalysis.track('Jup_Web/DT_search_fullMessageSearchDialog');
  }

  showFullPeopleSearch() {
    dataAnalysis.track('Jup_Web/DT_search_fullPeopleSearchDialog');
  }

  showFullGroupSearch() {
    dataAnalysis.track('Jup_Web/DT_search_fullGroupSearchDialog');
  }

  showFullTeamSearch() {
    dataAnalysis.track('Jup_Web/DT_search_fullTeamSearchDialog');
  }

  clearSearchHistory() {
    dataAnalysis.track('Jup_Web/DT_search_clearHistory');
  }

  gotoConversationFromSearch(source: string) {
    dataAnalysis.track('Jup_Web/DT_msg_goToConversation', { source });
  }

  jumpToPostInConversation(source: string) {
    dataAnalysis.track('Jup_Web/DT_msg_jumpToPostInConversation', { source });
  }

  outboundCallFromPeople(source: string) {
    dataAnalysis.track('Jup_Web/DT_phone_outboundCall', { source });
  }

  joinPublicTeamFromSearch(source: string) {
    dataAnalysis.track('Jup_Web/DT_msg_joinPublicTeam', { source });
  }

  filterContentSearchResultByType(type: string) {
    dataAnalysis.track('Jup_Web/DT_search_filterMessageByType', { type });
  }

  filterContentSearchResultByTime(time: string) {
    dataAnalysis.track('Jup_Web/DT_search_filterMessageByTimePosted', { time });
  }
  // end FIJI-7829

  // for global hot keys
  shortcuts(shortcut: string) {
    dataAnalysis.track('Jup_Web/DT_general_kbShortcuts', {
      shortcut,
    });
  }

  profileDialog(category: string, source: string) {
    dataAnalysis.page('Jup_Web/DT_profile_profileDialog', {
      category,
      source,
    });
  }

  addOrRemoveFavorite(
    source: string,
    action: string,
    conversationType: string,
  ) {
    dataAnalysis.track('Jup_Web/DT_profile_addOrRemoveFavorite', {
      source,
      action,
      conversationType,
    });
  }

  copyProfileField(field: string) {
    dataAnalysis.track('Jup_Web/DT_profile_copyProfileField', {
      field,
    });
  }

  toggleTeamVisibility(toggle: string, source: string) {
    dataAnalysis.track('Jup_Web/DT_profile_toggleTeamVisibility', {
      toggle,
      source,
    });
  }

  copyTeamURL() {
    dataAnalysis.track('Jup_Web/DT_profile_copyTeamURL');
  }

  copyTeamEmail() {
    dataAnalysis.track('Jup_Web/DT_profile_copyTeamEmail');
  }

  // [FIJI-7395]
  toggleLeftNavPanel(isExpanded: boolean) {
    const state = isExpanded ? 'expanded' : 'collapsed';

    dataAnalysis.track('Jup_Web/DT_general_toggleLeftNavigationPanel', {
      state,
    });
  }

  createTeamDialog(source = 'newActionsMenu') {
    this.page('Jup_Web/DT_msg_createTeamDialog', { source });
  }

  newMessageDialog(source = 'newActionsMenu') {
    this.page('Jup_Web/DT_msg_sendNewMessageDialog', { source });
  }
  // [FIJI-8153]
  endAndAnswerCall() {
    dataAnalysis.track('Jup_Web/DT_phone_endAndAnswerCall', {
      source: 'incomingCallWindow',
      type: 'multiCall',
    });
  }

  // [FIJI-8153]
  seeIncomingCallPage(type: 'singleCall' | 'multiCall') {
    dataAnalysis.page('Jup_Web/DT_phone_incomingCallWindow', {
      type,
    });
  }

  startConferenceCall(conversationType: string, source: string) {
    dataAnalysis.track('Jup_Web/DT_phone_startConferenceCall', {
      conversationType,
      source,
    });
  }

  joinConferenceCall(type?: string) {
    const source =
      type === 'link' ? 'click dial-in number' : 'click join button';
    dataAnalysis.track('Jup_Web/DT_msg_joinConferenceCall', {
      source,
    });
  }

  directToTransferPage() {
    dataAnalysis.page('Jup_Web/DT_phone_transferCall');
  }

  clickTransferActions(action: string) {
    dataAnalysis.track('Jup_Web/DT_phone_transferActions', {
      action,
    });
  }

  directToWarmTransferPage() {
    dataAnalysis.page('	Jup_Web/DT_phone_completeTransfer');
  }

  completeTransfer() {
    dataAnalysis.track('Jup_Web/DT_phone_completeTransferCall');
  }

  cancelTransferCall() {
    dataAnalysis.track('Jup_Web/DT_phone_cancelTransferCall');
  }
  // [FIJI-8195]
  login() {
    dataAnalysis.track('Jup_Web/DT_general_login');
  }
}

export { AnalyticsCollector };
