/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-12-13 09:48:07
 * Copyright © RingCentral. All rights reserved.
 */

import { StoredFile } from '../../module/item/entity';

export type AmazonFilePolicyRequestModel = {
  size: number;
  filename: string;
  for_file_type: boolean;
  filetype: string;
};

export type AmazonFileUploadPolicyData = {
  post_url: string;
  stored_file: StoredFile;
  signed_post_form: {
    key: string;
    acl: string;
    success_action_status: number;
    policy: string;
    'x-amz-server-side-encryption': string;
    'x-amz-algorithm': string;
    'x-amz-credential': string;
    'x-amz-date': string;
    'x-amz-signature': string;
  };
};
