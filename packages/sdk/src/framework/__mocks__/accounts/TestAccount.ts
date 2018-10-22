/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-06-24 16:18:57
 * Copyright © RingCentral. All rights reserved
*/

import { IAuthenticator, AbstractAccount } from '../..';
import { IAuthResponse, IAuthParams } from '../../account';

interface ITestLoginInfo extends IAuthParams {
  username: string;
  password: string;
}

class TestLogin implements ITestLoginInfo {
  username = '123';
  password = '123';

  isMatched(info: ITestLoginInfo): boolean {
    return info.username === this.username && info.password === this.password;
  }
}

const validUser = new TestLogin();

class TestAuthenticator implements IAuthenticator {
  async authenticate(loginInfo: ITestLoginInfo): Promise<IAuthResponse> {
    const isProvisioned = validUser.isMatched(loginInfo);
    if (isProvisioned) {
      return {
        success: true,
        accountInfos: [
          {
            type: TestAccount.name,
            data: 'demo_access_token',
          },
        ],
      };
    }

    return {
      success: false,
      error: new Error('invalid user!'),
    };
  }
}

class TestAccount extends AbstractAccount {
  updateSupportedServices(data: any): Promise<void> {
    throw new Error('Method not implemented.');
  }

  constructor() {
    super();
  }

  getAccountType(): string {
    return 'TEST';
  }

  protected getSupportedServicesByIndexData(indexData: any): string[] {
    return ['TestService'];
  }
}

export default TestAccount;
export { TestAccount, TestAuthenticator };
