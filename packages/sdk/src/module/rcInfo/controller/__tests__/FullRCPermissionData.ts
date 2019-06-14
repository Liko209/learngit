/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-05-27 16:44:13
 * Copyright © RingCentral. All rights reserved.
 */
const FULL_RC_PERMISSION_JSON = {
  uri:
    'https://api-ucc.ringcentral.com/restapi/v1.0/account/37439510/extension/803769020',
  id: 803769020,
  extensionNumber: '5360',
  contact: {
    firstName: 'Lip',
    lastName: 'Wang',
    department: 'Applications',
    email: 'lip.wang@ringcentral.com',
    emailAsLoginName: true,
    pronouncedName: {
      type: 'Default',
      text: 'Lip Wang',
    },
  },
  name: 'Lip Wang',
  type: 'User',
  status: 'Enabled',
  serviceFeatures: [
    {
      featureName: 'SMS',
      enabled: true,
    },
    {
      featureName: 'SMSReceiving',
      enabled: true,
    },
    {
      featureName: 'Pager',
      enabled: true,
    },
    {
      featureName: 'PagerReceiving',
      enabled: true,
    },
    {
      featureName: 'Voicemail',
      enabled: true,
    },
    {
      featureName: 'Fax',
      enabled: true,
    },
    {
      featureName: 'FaxReceiving',
      enabled: true,
    },
    {
      featureName: 'DND',
      enabled: true,
    },
    {
      featureName: 'RingOut',
      enabled: true,
    },
    {
      featureName: 'InternationalCalling',
      enabled: true,
    },
    {
      featureName: 'Presence',
      enabled: true,
    },
    {
      featureName: 'VideoConferencing',
      enabled: true,
    },
    {
      featureName: 'SalesForce',
      enabled: true,
    },
    {
      featureName: 'Intercom',
      enabled: true,
    },
    {
      featureName: 'Paging',
      enabled: true,
    },
    {
      featureName: 'Conferencing',
      enabled: true,
    },
    {
      featureName: 'VoipCalling',
      enabled: true,
    },
    {
      featureName: 'FreeSoftPhoneLines',
      enabled: true,
    },
    {
      featureName: 'HipaaCompliance',
      enabled: false,
      reason: 'AccountLimitation',
    },
    {
      featureName: 'CallPark',
      enabled: true,
    },
    {
      featureName: 'SharedLines',
      enabled: true,
    },
    {
      featureName: 'OnDemandCallRecording',
      enabled: true,
    },
    {
      featureName: 'Reports',
      enabled: false,
      reason: 'InsufficientPermissions',
    },
    {
      featureName: 'CallForwarding',
      enabled: true,
    },
    {
      featureName: 'DeveloperPortal',
      enabled: true,
    },
    {
      featureName: 'EncryptionAtRest',
      enabled: false,
      reason: 'AccountLimitation',
    },
    {
      featureName: 'BlockedMessageForwarding',
      enabled: false,
      reason: 'AccountLimitation',
    },
    {
      featureName: 'EmergencyCalling',
      enabled: false,
      reason: 'AccountLimitation',
    },
    {
      featureName: 'HDVoice',
      enabled: true,
    },
    {
      featureName: 'SingleExtensionUI',
      enabled: false,
      reason: 'AccountLimitation',
    },
    {
      featureName: 'CallSupervision',
      enabled: true,
    },
    {
      featureName: 'VoicemailToText',
      enabled: true,
    },
    {
      featureName: 'WebPhone',
      enabled: true,
    },
    {
      featureName: 'RCTeams',
      enabled: true,
    },
    {
      featureName: 'UserManagement',
      enabled: true,
    },
    {
      featureName: 'Calendar',
      enabled: true,
    },
    {
      featureName: 'PasswordAuth',
      enabled: true,
    },
    {
      featureName: 'CallerIdControl',
      enabled: false,
      reason: 'AccountLimitation',
    },
    {
      featureName: 'AutomaticInboundCallRecording',
      enabled: false,
      reason: 'AccountLimitation',
    },
    {
      featureName: 'AutomaticOutboundCallRecording',
      enabled: false,
      reason: 'AccountLimitation',
    },
    {
      featureName: 'AutomaticCallRecordingMute',
      enabled: false,
      reason: 'AccountLimitation',
    },
    {
      featureName: 'SoftPhoneUpdate',
      enabled: true,
    },
    {
      featureName: 'LinkedSoftphoneLines',
      enabled: false,
      reason: 'AccountTypeLimitation',
    },
    {
      featureName: 'CallQualitySurvey',
      enabled: false,
      reason: 'AccountLimitation',
    },
    {
      featureName: 'AccountFederation',
      enabled: true,
    },
    {
      featureName: 'MMS',
      enabled: true,
    },
    {
      featureName: 'CallParkLocations',
      enabled: true,
    },
    {
      featureName: 'ExternalDirectoryIntegration',
      enabled: true,
    },
    {
      featureName: 'CallSwitch',
      enabled: true,
    },
    {
      featureName: 'PromoMessage',
      enabled: true,
    },
    {
      featureName: 'SiteCodes',
      enabled: false,
      reason: 'AccountLimitation',
    },
    {
      featureName: 'InternationalSMS',
      enabled: true,
    },
    {
      featureName: 'ConferencingNumber',
      enabled: true,
    },
    {
      featureName: 'VoipCallingOnMobile',
      enabled: true,
    },
    {
      featureName: 'DynamicConference',
      enabled: false,
      reason: 'AccountLimitation',
    },
    {
      featureName: 'ConfigureDelegates',
      enabled: true,
    },
    {
      featureName: 'Archiver',
      enabled: true,
    },
    {
      featureName: 'EmergencyAddressAutoUpdate',
      enabled: false,
      reason: 'AccountLimitation',
    },
    {
      featureName: 'MobileVoipEmergencyCalling',
      enabled: false,
      reason: 'AccountLimitation',
    },
  ],
  regionalSettings: {
    timezone: {
      uri:
        'https://api-ucc.ringcentral.com/restapi/v1.0/dictionary/timezone/58',
      id: '58',
      name: 'US/Pacific',
      description: 'Pacific Time (US & Canada)',
      bias: '-480',
    },
    homeCountry: {
      uri: 'https://api-ucc.ringcentral.com/restapi/v1.0/dictionary/country/1',
      id: '1',
      name: 'United States',
      isoCode: 'US',
      callingCode: '1',
    },
    language: {
      id: '1033',
      name: 'English (United States)',
      localeCode: 'en-US',
    },
    greetingLanguage: {
      id: '1033',
      name: 'English (United States)',
      localeCode: 'en-US',
    },
    formattingLocale: {
      id: '1033',
      name: 'English (United States)',
      localeCode: 'en-US',
    },
    timeFormat: '12h',
  },
  setupWizardState: 'Completed',
  permissions: {
    admin: {
      enabled: false,
    },
    internationalCalling: {
      enabled: true,
    },
  },
  profileImage: {
    uri:
      'https://api-ucc.ringcentral.com/restapi/v1.0/account/37439510/extension/803769020/profile-image',
  },
  account: {
    uri: 'https://api-ucc.ringcentral.com/restapi/v1.0/account/37439510',
    id: '37439510',
  },
  hidden: false,
};

export { FULL_RC_PERMISSION_JSON };
