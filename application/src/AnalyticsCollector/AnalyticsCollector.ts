/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-04-08 15:28:50
 * Copyright © RingCentral. All rights reserved.
 */
import { dataAnalysis } from 'sdk';
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
import { ConversationType, NewConversationSource } from './types';

class AnalyticsCollector {
  constructor() {
    dataAnalysis.setProduction(config.isProductionAccount());
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

  // [FIJI-3202] Segment - Add event - Send post
  sendPost(source: string, postType: string, destination: string) {
    dataAnalysis.track('Jup_Web/DT_msg_postSent', {
      source,
      postType,
      destination,
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

  phoneGoToConversation(source: string) {
    dataAnalysis.track('Jup_Web/DT_msg_goToConversation', {
      source,
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
    dataAnalysis.track('Jup_Web/DT_conversation_addPerson', {
      conversationType,
      source,
    });
  }
}

export { AnalyticsCollector };
