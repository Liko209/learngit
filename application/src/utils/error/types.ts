/*
 * @Author: Paynter Chen
 * @Date: 2019-03-21 14:40:46
 * Copyright © RingCentral. All rights reserved.
 */
import { IErrorReporter as ISdkErrorReporter } from 'sdk/pal';

export interface IErrorReporter extends ISdkErrorReporter {
  setUserContextInfo: (contextInfo: UserContextInfo) => void;
}

export type UserContextInfo = {
  id: number;
  companyId: number;
  email: string;
  username: string;

  platform: string;
  env: string;
  version: string;

  browser: string;
  os: string;
};

export type ErrorFilterType = {
  messages: string[];
  tags?: { [key: string]: string };
};
