/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-28 14:04:00
 * Copyright © RingCentral. All rights reserved.
 */

import { ExtendedBaseModel } from '../../models';

export type PhoneNumberModel = {
  id: number;
  phoneNumber: string;
  usageType: string;
  label?: string;
};

export type SanitizedExtensionModel = {
  extensionNumber: string;
  type: string;
};

export type HeadShotModel =
  | string
  | {
      url: string;
      stored_file_id?: string;
      thumbs?: { key: string; value: string }[];
    };

export type Person = ExtendedBaseModel & {
  company_id: number;
  email: string;
  me_group_id: number;
  is_webmail?: boolean;
  first_user?: boolean;
  externally_registered?: boolean;
  state_id?: number;
  profile_id?: number;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  headshot?: HeadShotModel;
  headshot_version?: string;
  locked?: boolean;
  inviter_id?: number;
  rc_phone_numbers?: PhoneNumberModel[];
  sanitized_rc_extension?: SanitizedExtensionModel;
  is_pseudo_user?: boolean;
  glip_user_id?: number;
  away_status?: string;
  job_title?: string;
  pseudo_user_phone_number?: string;
  rc_account_id?: number;
  location?: string;
  homepage?: string;
  teams_removed_from?: number[];
  flags?: number;
  has_registered?: boolean;
  has_bogus_email?: boolean;
};
