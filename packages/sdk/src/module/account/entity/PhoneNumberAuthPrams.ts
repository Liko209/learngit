/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-06-28 15:44:10
 * Copyright © RingCentral. All rights reserved
*/
import { IAuthParams } from '../../../framework/account/IAuthenticator';
interface IPhoneNumberAuthPrams extends IAuthParams {
  phonenumber: string;
  extension: string;
  password: string;
}

export { IPhoneNumberAuthPrams };
