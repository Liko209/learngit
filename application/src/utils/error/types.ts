/*
 * @Author: Paynter Chen
 * @Date: 2019-03-21 14:40:46
 * Copyright © RingCentral. All rights reserved.
 */

export interface IErrorReporter {
  report: (error: Error) => void;
  setUserContextInfo: (contextInfo: UserContextInfo) => void;
}

export type UserContextInfo = {
  id: number;
  companyId: number;
  email: string;
  username: string;

  env: string;
  version: string;
};
