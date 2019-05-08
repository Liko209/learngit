/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-04-08 15:28:50
 * Copyright © RingCentral. All rights reserved.
 */
import { dataAnalysis } from 'sdk';
import { getGlobalValue, getEntity } from '@/store/utils';
import { GLOBAL_KEYS, ENTITY_NAME } from '@/store/constants';
import { fetchVersionInfo } from '@/containers/VersionInfo/helper';

class AnalyticsCollector {
  async identify() {
    const userId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
    if (!userId) {
      return { userId };
    }
    const user = getEntity(ENTITY_NAME.PERSON, userId);
    if (!user.companyId) {
      return { userId, user };
    }
    const company = getEntity(ENTITY_NAME.COMPANY, user.companyId);
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
}

export { AnalyticsCollector };
