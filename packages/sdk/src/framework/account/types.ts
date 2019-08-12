/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-07-29 14:58:41
 * Copyright © RingCentral. All rights reserved.
 */

type DataCollectionDetailsModel = {
  feature?: string;
  build_type?: string;
  user_id?: string;
  company_id?: string;
};

type DataCollectionEventModel = {
  details?: DataCollectionDetailsModel;
  type: string;
  timestamp: number;
};

type DataCollectionStatusModel = {
  event: DataCollectionEventModel;
};

type DataCollectionErrorModel = {
  code?: string;
  message?: string;
};

type DataCollectionSignInSuccessModel = DataCollectionStatusModel & {};

type DataCollectionSignInFailureDetailsModel = {
  event: {
    type: string;
    timestamp: number;
    details: DataCollectionDetailsModel & {
      error?: DataCollectionErrorModel;
    };
  };
};

type DataCollectionTraceLoginSuccessModel = {
  accountType: string;
  userId: number;
  companyId: number;
};

export {
  DataCollectionSignInSuccessModel,
  DataCollectionSignInFailureDetailsModel,
  DataCollectionTraceLoginSuccessModel,
};
