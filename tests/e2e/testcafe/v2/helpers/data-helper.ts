import 'testcafe';
import * as _ from "lodash";
import { IAccountPoolClient } from '../../libs/accounts';
import { ICompany, IUser, IGroup, IStep, Status } from '../models';
import { Allure2Dashboard, beatsClient, Test, Step, Attachment, DASHBOARD_UI, PASS, FAILED } from "../../config"

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

  // private getKeyfromValue(value: Status) {
  //   return _.findKey(Status, (v) => v === value);
  // }

  private async saveAttachment(file, stepId) {
    return await beatsClient.createAttachment({
      "file": file,
      "contentType": "step",
      "fileContentType": "multipart/form-data;",
      "objectId": stepId
    } as Attachment);
  }

  private async saveStep2Dashboard(step: IStep, testId: number) {
    let BStep = await beatsClient.createStep({
      "name": step.message,
      "status": Allure2Dashboard[step.status],
      "startTime": (new Date(step.startTime)).toISOString(),
      "endTime": (new Date(step.endTime)).toISOString()
    } as Step, this.t.ctx.testId);

    if (step.screenshotPath) {
      this.saveAttachment(step.screenshotPath, BStep.id);
    }
  }

  private async saveLogs() {
    let status = !_.some(this.t['testRun'].errs);
    let test = await beatsClient.createTest({ "name": this.t['testRun'].test.name, "status": status ? PASS : FAILED } as Test);
    this.t.ctx.testId = test.id;
    _.map(this.t.ctx.logs, (step) => this.saveStep2Dashboard(step, this.t.ctx.testId));
  }

  async setup(accountPoolClient: IAccountPoolClient, accountType: string) {
    this.accountPoolClient = accountPoolClient;
    this.originData = await this.accountPoolClient.checkOutAccounts(accountType);
    this.rcData = DataHelper.formatRcData(this.originData);
  }

  async teardown() {
    await this.accountPoolClient.checkInAccounts(this.originData);
    if (DASHBOARD_UI) {
      await this.saveLogs();
    }
  }
}

export { DataHelper };
