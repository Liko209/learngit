/*
 * @Author: doyle.wu
 * @Date: 2019-07-11 16:18:35
 */
import { JupiterUtils, PptrUtils } from '../utils';
import { Config } from '../config';
import { Selectors } from './selectors';
import * as bluebird from 'bluebird';

enum PhoneStatus {
  Init, Ready, Call, VoiceMail
}

const MaxWaitingTime = 60000;

class WebPhone {
  private phone: string;
  private pin: string;
  private status: PhoneStatus;
  private browser;
  private page;

  public constructor(phone: string, pin: string) {
    this.phone = phone;
    this.pin = pin;
    this.status = PhoneStatus.Init;
  }

  private async init() {
    if (this.status !== PhoneStatus.Init) {
      return;
    }

    this.browser = await PptrUtils.launch();
    this.page = await this.browser.newPage();

    const authUrl = await JupiterUtils.getAuthUrl(Config.jupiterHost, this.browser, this.phone, this.pin);

    await this.page.goto(authUrl);

    if (!(await PptrUtils.waitForSelector(this.page, Selectors.contactItem, { timeout: MaxWaitingTime }))) {
      await this.destroy();
      return;
    }

    if (!(await PptrUtils.waitForSelector(this.page, Selectors.dialpadBtn))) {
      await this.destroy();
      return;
    }

    await PptrUtils.click(this.page, Selectors.dialpadBtn);

    if (!(await PptrUtils.waitForSelector(this.page, Selectors.dialInput))) {
      await this.destroy();
      return;
    }

    this.status = PhoneStatus.Ready;
  }

  public async makeCall(phone: string, pin: string): Promise<boolean> {
    await this.init();

    if (this.status !== PhoneStatus.Ready) {
      return false;
    }

    await PptrUtils.setText(this.page, Selectors.dialInput, `${pin}`);

    let retryCount = 10;
    while (!await PptrUtils.waitForSelector(this.page, Selectors.endCallBtn, { timeout: 1000 }) && retryCount-- > 0) {
      await PptrUtils.click(this.page, Selectors.seachListItemDialBtn);
    }

    this.status = PhoneStatus.Call;
    return true;
  }

  public async makeVoiceMail(phone: string, pin: string): Promise<boolean> {
    await this.init();

    if (this.status !== PhoneStatus.Ready) {
      return false;
    }

    await PptrUtils.setText(this.page, Selectors.dialInput, `${pin}`);

    await PptrUtils.click(this.page, Selectors.seachListItemDialBtn);

    await bluebird.delay(2000);

    await PptrUtils.click(this.page, Selectors.keyPadBtn);

    await PptrUtils.click(this.page, Selectors.toVoiceMailBtn);

    this.status = PhoneStatus.VoiceMail;

    await bluebird.delay(22000);

    return true;
  }

  public async hangup(): Promise<boolean> {
    await this.init();

    if (this.status !== PhoneStatus.Call && this.status !== PhoneStatus.VoiceMail) {
      return true;
    }

    await PptrUtils.click(this.page, Selectors.endCallBtn);

    this.status = PhoneStatus.Ready;
    return true;
  }

  public async destroy(): Promise<boolean> {
    if (this.browser) {
      await PptrUtils.close(this.browser);
    }

    this.page = undefined;
    this.browser = undefined;
    this.status = PhoneStatus.Init;

    return true;
  }
}

export {
  WebPhone
}
