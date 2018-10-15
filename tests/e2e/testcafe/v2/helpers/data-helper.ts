import 'testcafe';
import { IAccountPoolClient } from '../../libs/accounts';
import { ICompany, IUser, IGroup } from '../models';

interface IRcData {
  mainCompany: ICompany,
  guestCompany: ICompany,
  anotherGuestCompany: ICompany,
}

class DataHelper {
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
          glipId: String(u.glip_id),
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

  private set originData(data: any) {
    this.t.ctx.__originData = data;
  }

  private get originData(): any {
    return this.t.ctx.__originData;
  }

  async setup(accountPoolClient: IAccountPoolClient, accountType: string) {
    this.accountPoolClient = accountPoolClient;
    this.originData = await this.accountPoolClient.checkOutAccounts(accountType);
    this.rcData = DataHelper.formatRcData(this.originData);
  }

  async teardown() {
    await this.accountPoolClient.checkInAccounts(this.originData);
  }
}

export { DataHelper };
