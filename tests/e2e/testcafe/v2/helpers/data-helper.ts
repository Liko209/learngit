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
        extension: user.sanitized_rc_extension ? user.sanitized_rc_extension.extensionNumber || '' : '',
      }
    }
    let companies = {}
    let phoneNumbers = []
    // unify main company number from account pool data.
    const formatNumberWithPlusSymbol = (phoneNumber: string) => {
      return (phoneNumber.indexOf('+') < 0) ? `+${phoneNumber}` : phoneNumber;
    }
    const getMainCompanyNumberFromUserData = (user) => {
      if (user.rc_phone_numbers) {
        const items = user.rc_phone_numbers
          .filter(item => item.usageType == "MainCompanyNumber")
          .map(rc_phone_number => rc_phone_number.phoneNumber);
        return formatNumberWithPlusSymbol(items[0]);
      }
      return user.email.split('@')[1];
    }
    const mainCompanyNumber = data.mainNumber ? formatNumberWithPlusSymbol(data.mainNumber) : data.companyEmailDomain;
    
    const glipUsers = _.partition(data.glipUsers, (user) => { return user.first_user == true });
    for (const admin of glipUsers[0]) {
      const companyEmailDomain = admin.email.split('@')[1];
      const companyNumber = getMainCompanyNumberFromUserData(admin);
      companies[companyNumber] = <ICompany>{
        type: data.accountType,
        brandId: String(data.brand),
        number: companyNumber,
        domain: companyEmailDomain,
      }
      companies[companyNumber]["admin"] = buildUsers(admin, companies[companyNumber])
      if (phoneNumbers.indexOf(companyNumber) < 0) {
        phoneNumbers.push(companyNumber);
      }
    };
    for (const phoneNumber in companies) {
      const users = glipUsers[1]
        .filter((user) => {
          const companyNumber = getMainCompanyNumberFromUserData(user)
          return companyNumber == phoneNumber;
        })
        .map(user => buildUsers(user, companies[phoneNumber]));
      companies[phoneNumber].users = users;
    }

    const mainCompany = companies[mainCompanyNumber];
    const glipTeams: any[] = data.teams || data.glipTeams;
    const groups = glipTeams.map((team) => {
      return <IGroup>{
        glipId: team._id,
      }
    })

    if (mainCompany) {
      mainCompany.groups = groups || [];
    }
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

  set needDeleted(needDeleted: boolean) {
    this.t.ctx.__needDeleted = needDeleted;
  }

  get needDeleted(): boolean {
    return this.t.ctx.__needDeleted;
  }

  set originData(data: any) {
    this.t.ctx.__originData = data;
  }

  get originData(): any {
    return this.t.ctx.__originData;
  }

  async setup(accountPoolClient: IAccountPoolClient, accountType: string, needDeleted: boolean = false) {
    this.accountPoolClient = accountPoolClient;
    this.needDeleted = needDeleted;
    const releaseStatus = needDeleted ? 'dirty' : undefined;
    this.originData = await this.accountPoolClient.checkOutAccounts(accountType, releaseStatus);
    if (this.originData.accountType.startsWith('kamino')) {
      this.rcData = DataHelper.formatKaminoRcData(this.originData);
    } else {
      this.rcData = DataHelper.formatRcData(this.originData);
    }
  }

  async teardown() {
    if (this.needDeleted) {
      await this.accountPoolClient.checkInAccounts(this.originData);
    } else {
      await this.accountPoolClient.addIntoAccounts(this.originData);
    }
  }
}

export { DataHelper };
