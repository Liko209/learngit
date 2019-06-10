/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-22 16:55:54
 * Copyright © RingCentral. All rights reserved.
 */

enum SubscriptionStatus {
  Active = 'Active',
  Suspended = 'Suspended',
  Blacklisted = 'Blacklisted',
}

enum ETransportType {
  PubNub = 'PubNub',
  APNS = 'APNS',
  PubNub_APNS_VoIP = 'PubNub/APNS/VoIP',
}

type RcSubscriptionInfo = {
  uri: string;
  id: string;
  creationTime: string;
  status: SubscriptionStatus;
  eventFilters: string[];
  expirationTime: string;
  expiresIn: number;
  deliveryMode: {
    transportType: ETransportType;
    encryption: boolean;
    address: string;
    subscriberKey: string;
    encryptionAlgorithm: string;
    encryptionKey: string;
  };
  blacklistedData?: {
    blacklistedAt: string;
    reason: string;
  };
};

type RcSubscriptionParams = {
  eventFilters: string[];
  deliveryMode: { transportType: ETransportType; encryption: boolean };
  expiresIn?: number;
};

export { RcSubscriptionInfo, RcSubscriptionParams, ETransportType };
