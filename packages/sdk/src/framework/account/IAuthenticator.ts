/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-06-24 14:24:51
 * Copyright © RingCentral. All rights reserved
 */
interface IAuthParams {}

interface IAccountInfo {
  type: string;
  data: any;
}

interface IAuthResponse {
  success: boolean;
  error?: Error;
  accountInfos?: IAccountInfo[];
  data?: any;
  isRCOnlyMode?: boolean;
}

interface IAuthenticator {
  authenticate(param: IAuthParams): Promise<IAuthResponse>;
}

interface ISyncAuthenticator {
  authenticate(param: IAuthParams): IAuthResponse;
}

export {
  IAuthParams,
  IAccountInfo,
  IAuthenticator,
  IAuthResponse,
  ISyncAuthenticator,
};
