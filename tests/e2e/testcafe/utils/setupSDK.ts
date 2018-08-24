import { SDK_ENV } from '../config';
import { SDK } from '../libs/sdk';
import { TestHelper } from '../libs/helpers';

interface ICredential {
  password:string;
  username: string;
  extension?: string;
}

export async function setupSDK(t:TestController, userId :number= 701) {
  const helper = TestHelper.from(t);
  const userCredentials:ICredential = {
    username:helper.companyNumber,
    password:helper.users[`user${userId}`].password,
    extension:helper.users[`user${userId}`].extension,
  };
  return new SDK(SDK_ENV).platform().login(userCredentials);
}
