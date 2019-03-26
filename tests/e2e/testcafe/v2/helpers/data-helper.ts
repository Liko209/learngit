import 'testcafe';
import * as _ from 'lodash';
import { IAccountPoolClient } from '../../libs/accounts';
import { ICompany, IUser, IGroup } from '../models';

interface IRcData {
  mainCompany: ICompany,
  guestCompany: ICompany,
  anotherGuestCompany: ICompany,
}

class DataHelper {
  static formatKaminoRcData(data: any) {
    const buildUsers = function (user, company: ICompany) {
      return <IUser>{
        company: company,
        rcId: String(user.rc_extension_id),
        email: user.email,
        password: user.password || 'Test!123',
        extension: user.sanitized_rc_extension.extensionNumber,
      }
    }
    let companies = {}
    let phoneNumbers = []
    const getMainCompanyNumberFromUserData = (user) => {
      const items = user.rc_phone_numbers
        .filter(item => item.usageType == "MainCompanyNumber")
        .map((rc_phone_number) => { return rc_phone_number.phoneNumber })
      return items[0]
    }
    const glipUsers = _.partition(data.glipUsers, (user) => { return user.first_user == true });
    for (const admin of glipUsers[0]) {
      if (admin.rc_phone_numbers) {
        const companyNumber = getMainCompanyNumberFromUserData(admin);
        const companyEmailDomain = admin.email.split('@')[1];
        companies[companyNumber] = <ICompany>{
          type: data.accountType,
          brandId: String(data.brand),
          number: companyNumber,
          domain: companyEmailDomain,
        }
        companies[companyNumber]["admin"] = buildUsers(admin, companies[companyNumber])
        if (phoneNumbers.indexOf(companyNumber) < 0) {
          phoneNumbers.push(companyNumber)
        }
      }
    };

    for (const phoneNumber in companies) {
      const users = glipUsers[1]
        .filter((user) => {
          if (user.rc_phone_numbers) {
            const companyNumber = getMainCompanyNumberFromUserData(user)
            return user['rc_extension_id'] && companyNumber == phoneNumber;
          }
          return false
        })
        .map(user => buildUsers(user, companies[phoneNumber]));
      companies[phoneNumber].users = users
    }

    const mainCompany = companies[data.mainNumber]
    const groups = data.teams.map((team) => {
      return <IGroup>{
        glipId: team._id,
      }
    })
    mainCompany.groups = groups;
    let guestCompany: ICompany, anotherGuestCompany: ICompany;
    if (phoneNumbers.length > 1) {
      const guestPhoneNumbers = _.pull(phoneNumbers, data.mainNumber);
      guestCompany = companies[guestPhoneNumbers[0]]
      anotherGuestCompany = companies[guestPhoneNumbers[1]]
    }
    return <IRcData>{ mainCompany, guestCompany, anotherGuestCompany };
  }


  static formatRcData(data: any) {
    const mainCompany = <ICompany>{
      type: data.accountType,
      brandId: String(data.brandId),
      number: String(data.mainCompanyNumber),
      domain: data.companyEmailDomain,
    }
    let admin, users;
    [admin, ...users] = ['system', 'user701', 'user702', 'user703', 'user704', 'user705', 'user706', 'user707', 'user708',]
      .map(k => {
        const u = data.users[k];
        return <IUser>{
          company: mainCompany,
          rcId: String(u.rc_id),
          email: u.email,
          password: u.password,
          extension: u.extension,
        }
      });
    mainCompany.admin = admin;
    mainCompany.users = users;
    mainCompany.groups = ["team1_u1_u2", "team2_u2_u3", "team3_u1_u2_u3", "team4_u3_u4_g1",]
      .map(k => {
        const g = data.teams[k];
        return <IGroup>{
          glipId: g.glip_id,
        }
      });
    // TODO: format guest company, another guest company
    return <IRcData>{ mainCompany, };
  }

  constructor(
    private t: TestController,
  ) { }

  private set accountPoolClient(accountPoolClient: IAccountPoolClient) {
    this.t.ctx.__accountPoolClient = accountPoolClient;
  }

  private get accountPoolClient(): IAccountPoolClient {
    return this.t.ctx.__accountPoolClient;
  }

  set rcData(data: IRcData) {
    this.t.ctx.__rcData = data;
  }

  get rcData(): IRcData {
    return this.t.ctx.__rcData;
  }

  set originData(data: any) {
    this.t.ctx.__originData = data;
  }

  get originData(): any {
    return this.t.ctx.__originData;
  }

  async setup(accountPoolClient: IAccountPoolClient, accountType: string) {
    this.accountPoolClient = accountPoolClient;
    this.originData = await this.accountPoolClient.checkOutAccounts(accountType);
    if (this.originData.accountType.startsWith('kamino')) {
      this.rcData = DataHelper.formatKaminoRcData(this.originData);
    } else {
      this.rcData = DataHelper.formatRcData(this.originData);
    }
  }

  async teardown() {
    await this.accountPoolClient.checkInAccounts(this.originData);
  }
}

export { DataHelper };
