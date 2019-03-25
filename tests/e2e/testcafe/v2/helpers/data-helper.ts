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
    const mainCompany = <ICompany>{
      type: data.accountType,
      brandId: String(data.brand),
      number: String(data.mainNumber),
      domain: data.companyEmailDomain,
    }
    // first_user of system user is true
    const glipUsers = _.partition(data.glipUsers, (user) => {
      return user.first_user == true && user.rc_phone_numbers[0].phoneNumber == mainCompany.number;
    });
    const buildUsers = function (user) {
      return <IUser>{
        company: mainCompany,
        rcId: String(user.rc_extension_id),
        email: user.email,
        password: user.password || 'Test!123',
        extension: user.sanitized_rc_extension.extensionNumber,
      }
    };
    const admins = glipUsers[0].map(user => buildUsers(user));
    // exclude glip service user with 0 as rc_extension_id
    const users = glipUsers[1].filter((user) => { return user['rc_extension_id'] && (user.rc_phone_numbers[0].phoneNumber == mainCompany.number) }).map(user => buildUsers(user));
    mainCompany.admin = admins[0];
    mainCompany.users = users;
    const groups = data.teams.map((team) => {
      return <IGroup>{
        glipId: team._id,
      }
    })
    mainCompany.groups = groups;
    // TODO: format guest company, another guest company

    let guestCompany: ICompany;
    const guestData = glipUsers[1].filter((user) => { return user['rc_extension_id'] && (user.rc_phone_numbers[0].phoneNumber != mainCompany.number) });
    if (guestData.length) {
      let guest: IUser[] =[];
      const phoneNumber = guestData[0].rc_phone_numbers[0].phoneNumber;
      const companyEmailDomain = guestData[0].email.split('@')[1];
      guestCompany = <ICompany>{
        type: data.accountType,
        brandId: String(data.brand),
        number: phoneNumber,
        domain: companyEmailDomain,
      }
      const buildGuests = function (user) {
        return <IUser>{
          company: guestCompany,
          rcId: String(user.rc_extension_id),
          email: user.email,
          password: user.password || 'Test!123',
          extension: user.sanitized_rc_extension.extensionNumber,
        }
      };
      for (const user of guestData) {
        if (user.first_user) {
          guestCompany.admin = buildGuests(user);
        } else {
          guest.push(buildGuests(user))
        }
      }
      guestCompany.users = guest;
    }
    
    return <IRcData>{ mainCompany, guestCompany };
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
