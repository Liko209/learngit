/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-28 14:42:00
 * Copyright © RingCentral. All rights reserved.
 */

import { ExtendedBaseModel } from '../../models';

enum E_ACCOUNT_TYPE {
  RC_OFFICE = 'RCOffice',
  RC_MOBILE = 'RCMobile',
  RC_MEETINGS = 'RCMeetings', // same as Freyja account
  RC_FAX = 'RCFax',
}

type CompanyServiceParameter = {
  accountId: number;
  id: number;
  value: E_ACCOUNT_TYPE;
};

type Company = ExtendedBaseModel & {
  name: string;
  domain: string | string[];
  admins: number[];
  custom_emoji: { [index: string]: { data: string } };
  _delta?: { add_keys?: object; remove_keys: object };
  rc_account_id?: number;
  webmail_person_id?: number;
  rc_service_parameters?: CompanyServiceParameter[];
  allow_rc_feature_rcphone?: boolean;
  rc_brand?: string;
};

export { Company, CompanyServiceParameter, E_ACCOUNT_TYPE };
